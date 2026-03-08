<script lang="ts">
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
</script>

<NavBar />

<div class="pt-16">
    <section class="relative mt-16 md:mt-[200px] px-6 md:px-[8vw] mb-16 md:mb-[200px]">
        <p class="background-big-letter hidden md:block">About</p>
        <div class="max-w-3xl">
            <h2>About the Bike Data Project</h2>
            <p class="mb-6">
                <strong>
                    With the Bike Data Project, Open Knowledge Belgium – the umbrella
                    organisation for open knowledge and open data initiatives in Belgium
                    – wants to build a community-driven open bike data platform that
                    collects data on where and when people actually cycle. The project
                    aims at aggregating data from cyclists, coming from different mobile
                    applications and sources, into one open bike data platform. The
                    collective open data will empower local communities in making
                    cycling more visible and decision-makers in making cities more
                    liveable and bike-friendly.
                </strong>
            </p>

            <h3>Short history: who's behind the project</h3>
            <p class="mb-4">
                The Bike Data Project was initially set up by <a
                    href="https://www.wgfilm.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline hover:text-primary-hover">WG film</a>
                and launched as part of the release of the
                <a
                    href="https://vimeo.com/ondemand/bikesvscars"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline hover:text-primary-hover">Bikes vs Cars documentary</a>,
                directed by Fredrik Gertten. The documentary has been screened
                in over 50 countries and helped kickstart a global community
                of cyclists sharing their ride data.
            </p>
            <p class="mb-4">
                At the beginning of 2020, the project was moved under the umbrella
                of Open Knowledge Belgium. <a
                    href="https://be.okfn.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline hover:text-primary-hover">Open Knowledge Belgium</a> (non-profit/vzw/asbl),
                as local chapter of Open Knowledge International, is an umbrella organisation
                for various open knowledge and open data initiatives in Belgium. We strive
                for a world where knowledge creates power for the many, not the few and
                proactively promote openness through projects and events, to the general
                public as well as to experts in the field. As grassroots organisation
                we consist of people, mainly volunteers, passionate about openness, using
                advocacy, research, technology and projects to unlock information, enabling
                people to use and share knowledge.
            </p>
            <p class="mb-8">
                Open Knowledge Belgium guarantees the openness of the project for
                all purposes and takes all required measures according to the GDPR
                regulations concerning data privacy and protection. With a
                transparent and clear terms of use for this project, Open Knowledge
                Belgium wants to set an example on how to deal with privacy-related
                issues and wants to take the opportunity to inform citizens about
                their digital rights.
            </p>

            <h3>More cycling data means more power to and for cyclists</h3>
            <p class="mb-4">
                Little is known about how cyclists move around in cities today. If
                there's data available, it's closed and restricted data sold by one
                single app provider or static data collected through manual counts.
                If we want to have more people cycling in cities and make the
                bicycle as easy and logical to opt for as the car, we also need to
                get the same data insights into cyclists' behavior as we have about
                car transport.
            </p>
            <p class="mb-8">
                Open Knowledge Belgium aims to create impact by showing where and
                when people actually cycle. The Bike Data Project provides the
                opportunity to collect all cycling data from different applications
                into one platform, which is - based on the principle of open source
                and open data - adaptable and accessible by everyone to ensure it
                benefits society.
            </p>

            <h3>Public digital infrastructure as common good</h3>
            <p class="mb-4">
                Similar to activities like OpenStreetMap Belgium and Open Planner
                Team by Open Knowledge Belgium, the Bike Data Project is set up as a
                collaborative project which is open to all and makes society benefit
                as a whole. Therefore, the digital infrastructure and aggregated
                data are - based on the principles of open source and open data -
                freely adaptable and accessible to anyone.
            </p>
            <p class="mb-4">
                Furthermore, Open Knowledge Belgium strives to play with this Bike
                Data Project an important role in wider societal movements:
            </p>
            <ul class="list-disc pl-6 space-y-3 mb-8">
                <li>
                    <span class="font-semibold">Citizens can take back control of their data</span> thanks to
                    strong European GDPR regulations. In the case of the Bike Data Project,
                    we want to encourage citizens to get their data out of third party
                    apps (e.g. popular apps as Strava and even potentially Google Maps)
                    and ask them to contribute them to a good cause.
                </li>
                <li>
                    <span class="font-semibold">Promote skill sharing and encourage learning within the
                    community</span> throughout the whole process from project launch
                    to further development of the platform. Strongly inspired by the work
                    of the School of Data in Riga, we want to involve the cycling community
                    in the local Bike Data Project campaigns as from the first day. Throughout
                    a series of community events, Open Knowledge Belgium wants to improve
                    data literacy.
                </li>
                <li>
                    <span class="font-semibold">Think globally, act locally.</span> The Bike Data Project platform
                    is global and open by default. Although it is possible for cycling
                    communities all around the world to contribute to the project, Open
                    Knowledge Belgium wants to support local communities with making them
                    act on a local level.
                </li>
            </ul>

            <h3>Sustainability</h3>
            <p>
                The Bike Data Project platform is global and maintained by the open
                source community. The platform stays online and freely available,
                and cycling communities anywhere in the world are welcome to use it.
                All source code is available on
                <a
                    href="https://github.com/bikedataproject"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline hover:text-primary-hover">GitHub</a>.
            </p>
        </div>
    </section>
</div>
<Footer />
