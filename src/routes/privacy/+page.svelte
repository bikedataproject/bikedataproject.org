<script lang="ts">
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
</script>

<NavBar />

<div class="pt-16">
    <section class="relative mt-16 md:mt-[200px] px-6 md:px-[8vw] mb-16 md:mb-[200px]">
        <div class="max-w-3xl">
            <h2>Privacy Policy</h2>
            <p class="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

            <h3>1. Who we are</h3>
            <p class="mb-6">
                The Bike Data Project is managed by <strong>Open Knowledge Belgium VZW/ASBL</strong>,
                Witte Patersstraat / Rue des Pères Blancs 4, 1040 Etterbeek (Brussels), Belgium.
                Enterprise number: BE 0845 419 930.
                Contact: <a href="mailto:info@bikedataproject.org" class="text-primary underline hover:text-primary-hover">info@bikedataproject.org</a>.
            </p>

            <h3>2. What data we collect</h3>
            <p class="mb-4">When you use the Bike Data Project, we collect:</p>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Account data</strong> — Email address and a user identifier, collected when you register via our self-hosted authentication provider.</li>
                <li><strong>Cycling GPS tracks</strong> — GPS coordinates, elevation, and timestamps recorded during your rides, either uploaded as GPX files or recorded via our mobile app.</li>
                <li><strong>Activity metadata</strong> — Distance and the source of the data (e.g. mobile app, manual upload).</li>
            </ul>
            <p class="mb-6">
                In the future, we may offer the option to share additional demographic information
                such as age range, gender, or ride purpose. This will always be voluntary and
                used only in aggregate to better understand cycling populations.
            </p>

            <h3>3. Why we collect it</h3>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li>To aggregate cycling data and publish anonymised open datasets that help cities improve cycling infrastructure.</li>
                <li>To provide you with personal statistics about your contributions.</li>
                <li>To send you account-related emails (e.g. email verification, password reset).</li>
            </ul>

            <h3>4. Legal basis (GDPR)</h3>
            <p class="mb-6">
                We process your data based on your <strong>consent</strong>, which you give when you create an account
                and upload your cycling data. You can withdraw your consent at any time by requesting deletion
                of your data.
            </p>

            <h3>5. How we use and publish data</h3>
            <p class="mb-4">
                You choose how your cycling data is shared. When you contribute data, you can select one of three sharing levels:
            </p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Open</strong> — Your raw tracks are published as open data, freely available to anyone. Your data is also shared with partners and included in anonymised datasets.</li>
                <li><strong>Partners only</strong> — Your data is shared privately with our partners (e.g. city planners, mobility researchers) and included in anonymised datasets, but is not publicly available.</li>
                <li><strong>Anonymised</strong> — Your data is only used in aggregated, anonymised datasets where individual tracks cannot be identified.</li>
            </ul>
            <p class="mb-6">
                You can change your sharing preference at any time.
                Aggregated open data is published under the <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover">Open Database License (ODbL)</a>.
            </p>

            <h3>6. Data storage and security</h3>
            <p class="mb-6">
                Your data is stored on servers hosted by Hetzner in the EU (Helsinki, Finland).
                Access is secured via encrypted connections.
            </p>

            <h3>7. Third-party services</h3>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Authentication</strong> — Self-hosted. Your email and user ID are stored on our own servers.</li>
                <li><strong>Hetzner Cloud</strong> — Server infrastructure provider (EU).</li>
            </ul>
            <p class="mb-6">
                We do not share your personal data with any other third parties, and we do not use analytics or tracking cookies.
            </p>

            <h3>8. Data retention</h3>
            <p class="mb-6">
                Your data is retained for as long as your account exists. If you request deletion,
                we will remove your account and all associated cycling data.
            </p>

            <h3>9. Your rights</h3>
            <p class="mb-4">Under the GDPR, you have the right to:</p>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Access</strong> — Request a copy of your personal data.</li>
                <li><strong>Rectification</strong> — Correct inaccurate data.</li>
                <li><strong>Erasure</strong> — Request deletion of your data.</li>
                <li><strong>Portability</strong> — Receive your data in a machine-readable format.</li>
                <li><strong>Withdraw consent</strong> — Stop data processing at any time.</li>
            </ul>
            <p class="mb-6">
                To exercise any of these rights, contact us at
                <a href="mailto:info@bikedataproject.org" class="text-primary underline hover:text-primary-hover">info@bikedataproject.org</a>.
            </p>

            <h3>10. Changes to this policy</h3>
            <p>
                We may update this privacy policy from time to time. Changes will be posted on this page
                with an updated date.
            </p>
        </div>
    </section>
</div>
<Footer />
