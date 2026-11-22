import json

import pytest

from .conftest import BOND, DEADLINE, PAYOUT, QUOTE, SHA, STAKE, UNTIL, URL


def refused(preview, write, contains):
    assert preview.startswith("[EXPECTED] ") and contains in preview
    with pytest.raises(Exception) as caught:
        write()
    error = caught.value
    assert getattr(error, "message", str(error)) == preview


@pytest.mark.parametrize("name,payout,days,value,reason", [
    (" ", PAYOUT, 7, BOND, "name"), ("x"*81, PAYOUT, 7, BOND, "name"),
    ("x", 1, 7, BOND, "payout"), ("x", PAYOUT, 6, BOND, "days"),
    ("x", PAYOUT, 366, BOND, "days"), ("x", PAYOUT, 7, PAYOUT-1, "cover"),
])
def test_pledge_refusals(s, name, payout, days, value, reason):
    refused(s.c.preview_pledge(s.a, name, str(payout), days, str(value)),
            lambda: s.call("create_pledge", (name, payout, days), value=value), reason)
    s.solvent()


@pytest.mark.parametrize("field,value,reason", [
    (1, "../demo", "repo"), (1, "./demo", "repo"), (1, "org/with space", "repo"),
    (1, "https://example.org/demo", "repo"), (1, "org/demo?at=main", "repo"),
    (2, "a"*39, "SHA"), (2, "z"*40, "SHA"),
    (3, "http://example.org", "HTTPS"), (3, "https://demo.org/"+"a"*512, "URL"),
    (4, "", "quote"), (4, "missing quote", "quote not found"), (4, "x"*401, "quote"),
    (5, 9, "minutes"), (5, 129601, "minutes"), (5, 7*1440, "coverage"),
])
def test_registration_refusals(s, field, value, reason):
    s.pledge()
    args = [0, "org/demo", SHA, URL, QUOTE, 10]
    args[field] = value
    refused(s.c.preview_register(s.a, *args), lambda: s.call("register_claim", args), reason)
    assert json.loads(s.c.get_stats())["claims"] == 0


def test_registration_records_normalized_pin_quote_and_latest_window(s):
    s.pledge()
    assert s.register(" Org/Demo ", SHA.upper(), 15) == 0
    assert s.register() == 1
    c = json.loads(s.c.get_claim(0))
    assert (c["hf_repo"], c["revision_sha"], c["declared_grade"]) == ("Org/Demo", SHA, "OPEN")
    assert len(c["claim_page_sha256"]) == 64 and c["claim_page_status"] == 200
    assert json.loads(s.c.get_pledge(0))["locked_until"] == c["challenge_until"]
    assert s.c.claim_status(0) == "LIVE"


def test_early_close_and_late_challenge(s):
    s.pledge()
    s.register()
    refused(s.c.preview_close(s.a, 0), lambda: s.call("close_pledge", (0,)), "open until " + UNTIL)
    s.vm.warp(UNTIL)
    refused(s.c.preview_challenge(s.b, 0, str(STAKE)), s.challenge, "challenge period ended (" + UNTIL + ")")
    for row in (json.loads(s.c.get_claim(0)), json.loads(s.c.claim_window(0)), json.loads(s.c.list_claims(0))[0]):
        assert row["status"] == "CLOSED"
    assert s.c.claim_status(0) == "CLOSED"
    assert s.call("close_pledge", (0,)) == BOND
    assert s.call("withdraw") == BOND
    refused(s.c.preview_withdraw(s.a), lambda: s.call("withdraw"), "nothing to withdraw")


def test_open_challenge_locks_reserve_until_expiry(s):
    s.pledge()
    s.register()
    s.challenge()
    p = json.loads(s.c.get_pledge(0))
    assert int(p["bond"]) == BOND - PAYOUT and int(p["reserved"]) == PAYOUT
    assert json.loads(s.c.list_challenges(0))[0]["status"] == "OPEN"
    refused(s.c.preview_expire(0), lambda: s.call("expire", (0,)), "still open")
    s.vm.warp(UNTIL)
    refused(s.c.preview_close(s.a, 0), lambda: s.call("close_pledge", (0,)), "still open")
    s.vm.warp(DEADLINE)
    assert "call expire" in s.c.preview_resolve(0)
    assert s.call("expire", (0,)) == "EXPIRED"
    assert s.c.claim_status(0) == "CLOSED"
    assert s.call("close_pledge", (0,)) == BOND
    assert s.call("withdraw", sender=s.bob) == STAKE
    assert s.call("withdraw") == BOND


def test_only_publisher_can_manage(s):
    s.pledge()
    refused(s.c.preview_top_up(s.b, 0, "1"), lambda: s.call("top_up", (0,), s.bob, 1), "publisher")
    refused(s.c.preview_close(s.b, 0), lambda: s.call("close_pledge", (0,), s.bob), "publisher")
    refused(s.c.preview_top_up(s.a, 0, "0"), lambda: s.call("top_up", (0,)), "positive")
    assert s.call("top_up", (0,), value=STAKE) == BOND + STAKE


def test_challenge_refusals_and_standing(s):
    s.pledge()
    s.register()
    refused(s.c.preview_challenge(s.a, 0, str(STAKE)), lambda: s.call("challenge", (0,), value=STAKE), "publisher")
    refused(s.c.preview_challenge(s.b, 0, "1"), lambda: s.call("challenge", (0,), s.bob, 1), "below")
    s.challenge()
    refused(s.c.preview_challenge(s.b, 0, str(STAKE)), s.challenge, "already open")
    assert json.loads(s.c.standing(s.a))["bonded_now"] == str(BOND)


def test_bond_exhaustion(s):
    s.pledge(PAYOUT)
    s.register()
    s.register()
    s.challenge()
    refused(s.c.preview_challenge(s.b, 1, str(STAKE)), lambda: s.challenge(1), "insufficient")


def test_concurrent_challenge_cap(s):
    s.pledge(6 * PAYOUT)
    for i in range(6):
        s.register()
        if i < 5:
            s.challenge(i)
    refused(s.c.preview_challenge(s.b, 5, str(STAKE)), lambda: s.challenge(5), "five")


def test_claim_limit(s):
    s.pledge()
    for i in range(50):
        assert s.register() == i
    refused(s.c.preview_register(s.a, 0, "org/demo", SHA, URL, QUOTE, 10), s.register, "limit")


def test_close_without_claims_and_refuse_later_top_up(s):
    s.pledge()
    assert s.call("close_pledge", (0,)) == BOND
    refused(s.c.preview_top_up(s.a, 0, "1"), lambda: s.call("top_up", (0,), value=1), "closed")
