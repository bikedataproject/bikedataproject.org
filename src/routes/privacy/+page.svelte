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
                <li><strong>Account data</strong> — Email address and a user identifier, collected when you register via our authentication provider (Keycloak).</li>
                <li><strong>Cycling GPS tracks</strong> — GPS coordinates, elevation, and timestamps recorded during your rides, either uploaded as GPX files or recorded via our mobile app.</li>
                <li><strong>Activity metadata</strong> — Distance and the source of the data (e.g. mobile app, manual upload).</li>
            </ul>
            <p class="mb-6">
                We do <strong>not</strong> collect your name, age, gender, or any other personal profile information beyond your email address.
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
                Individual cycling tracks are aggregated into collective, anonymised datasets. We apply the following safeguards:
            </p>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li>Data only appears in public datasets if at least 3 different cyclists have used a specific road segment.</li>
                <li>Published data cannot be traced back to individual cyclists.</li>
                <li>Aggregated data is published under a <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover">Creative Commons Attribution 4.0</a> license.</li>
            </ul>

            <h3>6. Data storage and security</h3>
            <p class="mb-6">
                Your data is stored on servers hosted by Hetzner in the EU (Helsinki, Finland).
                Access is secured via SSH key authentication and encrypted connections.
                Database credentials are managed via Docker Swarm secrets.
            </p>

            <h3>7. Third-party services</h3>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Keycloak</strong> — Self-hosted authentication. Your email and user ID are stored in our Keycloak instance.</li>
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
