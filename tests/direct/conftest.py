"""Shared fixtures and helpers for OpenWash direct mode tests."""

import json
import os
import sys
import tempfile

import pytest

if sys.platform == "win32":
    # genlayer-test 0.29.2 unlinks the stdin temp file while fd 0 still holds it open,
    # which Windows refuses (WinError 32). Same logic, with a delete-on-close file instead.
    from gltest.direct import loader as _gltest_loader

    def _inject_message_to_fd0_windows(vm):
        from genlayer.py import calldata
        from genlayer.py.types import Address

        def _addr(a):
            return Address(a) if isinstance(a, bytes) else a

        encoded = calldata.encode({
            "contract_address": _addr(vm._contract_address),
            "sender_address": _addr(vm.sender),
            "origin_address": _addr(vm.origin),
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        })
        with tempfile.TemporaryFile() as tmp:
            tmp.write(encoded)
            tmp.flush()
            os.lseek(tmp.fileno(), 0, os.SEEK_SET)
            vm._original_stdin_fd = os.dup(0)
            os.dup2(tmp.fileno(), 0)

    _gltest_loader._inject_message_to_fd0 = _inject_message_to_fd0_windows

import re

BOND = 2 * 10**17
PAYOUT = 10**17
STAKE = 10**16
URL = "https://example.org/claim"
QUOTE = "Demo is open source"
SHA = "a" * 40
START = "2026-11-22T12:00:00Z"
UNTIL = "2026-11-22T12:10:00Z"
DEADLINE = "2026-11-25T12:00:00Z"


def mock_get(vm, url, body, status=200):
    if isinstance(body, str):
        body = body.encode()
    vm.mock_web("^" + re.escape(url) + "$", {"method": "GET", "response": {
        "status": status, "headers": {}, "body": body}})


class Scenario:
    def __init__(self, vm, contract, alice, bob):
        self.vm, self.c = vm, contract
        self.alice, self.bob = alice, bob
        self.balance = 0
        self.sent = []
        from genlayer.py.types import Address
        self.a, self.b = Address(alice).as_hex, Address(bob).as_hex

        def transfer(vm, request):
            for op in ("EthSend", "PostMessage"):
                if op in request:
                    self.sent.append(int(request[op]["value"]))
            return None
        vm._gl_call_hook = transfer

    def call(self, method, args=(), sender=None, value=0):
        self.vm.sender = self.alice if sender is None else sender
        self.vm.value = value
        try:
            result = getattr(self.c, method)(*args)
        finally:
            self.vm.value = 0
        self.balance += value
        self.solvent()
        return result

    def solvent(self):
        stats = json.loads(self.c.get_stats())
        held = int(stats["total_credits"])
        for i in range(stats["pledges"]):
            p = json.loads(self.c.get_pledge(i))
            held += int(p["bond"]) + int(p["reserved"])
            if not p["active"]:
                assert p["bond"] == p["reserved"] == "0"
        for i in range(stats["challenges"]):
            ch = json.loads(self.c.get_challenge(i))
            if ch["status"] == "OPEN":
                held += int(ch["stake"])
        assert held == self.balance - sum(self.sent)

    def pledge(self, value=BOND):
        return self.call("create_pledge", ("Publisher", PAYOUT, 7), value=value)

    def register(self, repo="org/demo", sha=SHA, minutes=10):
        return self.call("register_claim", (0, repo, sha, URL, QUOTE, minutes))

    def challenge(self, claim_id=0):
        return self.call("challenge", (claim_id,), self.bob, STAKE)


@pytest.fixture
def s(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(START)
    contract = direct_deploy("contracts/open_wash.py", 10)
    mock_get(direct_vm, URL, "<p>ＤＥＭＯ is <em>open</em>  source</p>")
    return Scenario(direct_vm, contract, direct_alice, direct_bob)
