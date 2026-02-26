<script lang="ts">
    import "../../app.css";
    import 'maplibre-gl/dist/maplibre-gl.css';
    import Logo from "$lib/svg/Logo.svelte";
    import {appManager} from "$lib/AppManager";
    import type {LayoutProps} from "./$types";

    let {data, children}: LayoutProps = $props();

    let open: boolean = $state(false);
    function onOpenClick() {
        open = true;
    }

    function onCloseClick() {
        open = false;
    }
</script>

<div>
    <div class="relative z-40 lg:hidden" role="dialog" aria-modal="true">
        {#if open}
        <div class="fixed inset-0 bg-gray-900/80" aria-hidden="true"></div>

        <div class="fixed inset-0 flex ">
            <div class="relative mr-16 flex w-full max-w-xs flex-1">
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" class="-m-2.5 p-2.5 cursor-pointer" onclick={onCloseClick}>
                        <span class="sr-only">Close sidebar</span>
                        <svg class="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" aria-hidden="true" data-slot="icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 bg-dark">
                        <a href={appManager.settings.public_url}>
                            <h1 class="flex h-16 shrink-0 items-center text-light text-l">
                                <Logo class="h-8 w-auto text-light mr-2"/>
                                Bike Data Project
                            </h1>
                        </a>
                    <nav class="flex flex-1 flex-col">
                        <ul role="list" class="flex flex-1 flex-col gap-y-7">
<!--                            <MainMenu {data} onused={() => { open = false }} />-->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
        {/if}
    </div>

    <div class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-60 lg:flex-col bg-dark">
        <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 pb-4">
            <a href={appManager.settings.public_url}>
                <h1 class="flex h-16 shrink-0 items-center text-light text-l">
                    <Logo class="h-8 w-auto text-light mr-2"/>
                    Bike Data Project
                </h1>
            </a>
            <nav class="flex flex-1 flex-col">
                <ul role="list" class="flex flex-1 flex-col gap-y-7">
<!--                    <MainMenu {data} onused={() => { open = false }} />-->
                </ul>
            </nav>
        </div>
    </div>

    <div class="lg:pl-60">
        <div class="lg:hidden sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-dark px-4 shadow-sm sm:px-6 lg:px-8">
            <button type="button" class="-m-2.5 p-2.5 text-light cursor-pointer" onclick={onOpenClick}>
                <span class="sr-only">Open sidebar</span>
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="size-5">
                    <path d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
            </button>

            <div class="flex flex-1 gap-x-4 self-stretch">
                <h1 class="hidden sm:flex h-16 shrink-0 items-center text-light text-l ml-auto">
                    ANYWAYS
                </h1>
                <h1 class="flex h-16 shrink-0 items-center text-light text-l ml-auto">
                    <Logo class="h-8 w-auto text-light mr-2"/>
                </h1>
            </div>
        </div>

        {@render children()}
    </div>
</div>