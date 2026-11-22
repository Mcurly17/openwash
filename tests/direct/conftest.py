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
