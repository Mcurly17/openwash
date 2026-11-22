# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class OpenWash(gl.Contract):
    min_challenge_minutes: u32

    def __init__(self, min_challenge_minutes: int):
        if not 10 <= min_challenge_minutes <= 129600:
            raise gl.vm.UserError("[EXPECTED] minimum challenge period must be 10 to 129600 minutes")
        self.min_challenge_minutes = u32(min_challenge_minutes)

    @gl.public.view
    def get_min_challenge_minutes(self) -> int:
        return int(self.min_challenge_minutes)
