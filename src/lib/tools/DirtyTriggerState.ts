export type DirtyTriggerState =
    "idle" | // there is nothing going on.
    "dirty" | // already dirty, but it has not been triggered yet but will soon.
    "updating" | // already dirty, but there was another update before the trigger could happen, it is waiting until
    "triggered" // triggered, wait until idle again before doing anything else