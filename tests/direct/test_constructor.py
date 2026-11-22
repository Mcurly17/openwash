import pytest


@pytest.mark.parametrize("minutes", [10, 10080, 129600])
def test_deployment_floor(direct_deploy, minutes):
    deployed = direct_deploy("contracts/open_wash.py", minutes)
    assert deployed.get_min_challenge_minutes() == minutes


@pytest.mark.parametrize("minutes", [9, 129601])
def test_invalid_floor(direct_deploy, minutes):
    with pytest.raises(Exception, match="minimum challenge period"):
        direct_deploy("contracts/open_wash.py", minutes)
