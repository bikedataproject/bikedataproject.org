<script lang="ts">
    import Logo from "$lib/svg/Logo.svelte";
    let mobileOpen: boolean = $state(false);
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-dark">
    <div class="mx-auto px-6 md:px-[100px] flex items-center justify-between h-16">
        <a href="/" class="flex-shrink-0">
            <Logo class="text-white" />
        </a>

        <!-- Desktop nav -->
        <div class="hidden lg:flex items-center gap-1">
            <a href="/datamap" class="text-white/80 hover:text-white px-3 py-2 text-sm">The Data</a>
            <a href="/faq" class="text-white/80 hover:text-white px-3 py-2 text-sm">FAQ</a>
            <a href="/about" class="text-white/80 hover:text-white px-3 py-2 text-sm">About</a>
            <a href="https://wiki.bikedataproject.org/" class="text-white/80 hover:text-white px-3 py-2 text-sm">Wiki</a>
            <a href="/share-data" class="ml-2 px-4 py-2 bg-primary text-white font-semibold rounded text-sm hover:bg-primary-hover">
                Participate
            </a>
        </div>

        <!-- Mobile hamburger -->
        <button
            class="lg:hidden text-white p-2 cursor-pointer"
            onclick={() => mobileOpen = !mobileOpen}
            aria-label="Toggle menu">
            {#if mobileOpen}
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            {:else}
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            {/if}
        </button>
    </div>

    <!-- Mobile menu -->
    {#if mobileOpen}
        <div class="lg:hidden bg-dark border-t border-white/10 px-6 py-4 flex flex-col gap-2">
            <a href="/datamap" class="text-white/80 hover:text-white py-2 text-sm" onclick={() => mobileOpen = false}>The Data</a>
            <a href="/faq" class="text-white/80 hover:text-white py-2 text-sm" onclick={() => mobileOpen = false}>FAQ</a>
            <a href="/about" class="text-white/80 hover:text-white py-2 text-sm" onclick={() => mobileOpen = false}>About</a>
            <a href="https://wiki.bikedataproject.org/" class="text-white/80 hover:text-white py-2 text-sm">Wiki</a>
            <a href="/share-data" class="mt-2 px-4 py-2 bg-primary text-white font-semibold rounded text-sm text-center hover:bg-primary-hover" onclick={() => mobileOpen = false}>
                Participate
            </a>
        </div>
    {/if}
</nav>
