<script lang="ts">
    import NavBar from "$lib/home/NavBar.svelte";
    import Question from "$lib/home/Question.svelte";
    import Footer from "$lib/home/Footer.svelte";
</script>

<NavBar />

<div class="pt-16">
    <section class="relative mt-16 md:mt-[200px] px-6 md:px-[8vw] mb-16 md:mb-[200px]">
        <p class="background-big-letter hidden md:block">Faq</p>
        <div class="max-w-4xl">
            <h2>Frequently Asked Questions</h2>
            <div class="divide-y divide-gray-200 border-t border-gray-200">
                <Question question="Why should I participate in this project?">
                    <p>
                        By contributing your cycling data, you can help make our cities
                        better adapted to cyclists.
                    </p>
                    <p>
                        More cycling data means more power to and for cyclists. Little is
                        known about how cyclists move around in cities today. If there's
                        data available, it's closed and restricted data sold by one single
                        app provider or static data collected through manual counts. If we
                        want to have more people cycling in cities and make the bicycle as
                        easy and logical to opt for as the car, we also need to get the
                        same data insights into cyclists' behavior as we have about car
                        transport.
                    </p>
                </Question>

                <Question question="How does this project work?">
                    <p>
                        To make this work we want to ask you to contribute your cycling
                        data. We need to know where you ride your bicycle. Your data
                        contributions, combined with the data from many other cyclists,
                        will make cities more adapted to cyclists.
                    </p>
                    <p>
                        We ask different types of cyclists (e.g., daily commuters,
                        delivery riders, sportsmen and tourists) to track their bicycle
                        rides via their preferred mobile application and contribute their
                        data to our community-driven bike data platform. Every kind of
                        cyclist has something to contribute to this project. Some people
                        already track their activity for training purposes. That's great,
                        but we also really want to take into account the short routes:
                        commuting to work, dropping the kids off at school or a quick ride
                        to the grocery store.
                    </p>
                    <p>
                        In return, the anonymous aggregated cycling data will be opened up
                        to the public and can be freely used by anyone. We aim to create
                        impact by showing where and when people actually cycle. More data
                        means more influence over those in power to make cities more
                        sustainable and bike-friendly.
                    </p>
                </Question>

                <Question question="How do I contribute my data?">
                    <p>
                        There are two ways to contribute your cycling data:
                    </p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>
                            <span class="font-semibold">Mobile app</span> — Install our
                            <a href="https://github.com/bikedataproject/mobile-app/releases/latest" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover">Android app</a>,
                            hit record, and your ride is uploaded automatically.
                        </li>
                        <li>
                            <span class="font-semibold">GPX upload</span> — Export rides from any cycling app
                            (Garmin, Strava, Wahoo, etc.) as GPX files and upload them on our
                            <a href="/share-data" class="text-primary underline hover:text-primary-hover">share data</a> page.
                        </li>
                    </ul>
                </Question>

                <Question question="What is happening with my data?">
                    <p>
                        The data collected by this project consists of contributions made
                        by all different kinds of cyclists. All individual cycling data
                        are aggregated into collective data. The collective data gives us
                        patterns we can use to demonstrate where and when cyclists ride
                        their bicycles.
                    </p>
                    <p>
                        The anonymous aggregated cycling data will be opened up to the
                        public as open data. The open data provided by the Bike Data
                        Project platform can be freely used by different stakeholders and
                        for different purposes. Here's a non-exhaustive list of different
                        use cases of the open data:
                    </p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>
                            Transportation experts, city planners, mobility planners and
                            urban designers around the world need open data like this to
                            help them develop modern infrastructure and sustainable cities.
                        </li>
                        <li>
                            Citizens can get a high-level overview of the number of cyclists
                            and kilometers cycled in the city and check out a map with the
                            number of cyclists per route.
                        </li>
                        <li>
                            Civil society and journalists use the data to analyse the
                            situation for cyclists in the city, such as the amount of time
                            cyclists lose on average at traffic lights.
                        </li>
                        <li>
                            Data and software companies can dive into the data to obtain
                            smart cycling insights and build tools like advanced cycling
                            route planners and recommendation engines to improve cycling
                            infrastructure. The data can also be very useful for other bike
                            related products and services.
                        </li>
                    </ul>
                </Question>

                <Question question="Is my privacy respected when I contribute my data?">
                    <p>
                        Yes, Open Knowledge Belgium guarantees the openness of the project
                        so that society benefits as a whole and takes all required
                        measures according to the GDPR regulations concerning data privacy
                        and protection.
                    </p>
                    <p>
                        We are collecting cycling data of many individual cyclists and aim
                        to make the anonymous aggregated data available to the public as
                        open data. The aggregated data will be published in a way that
                        it's not possible to retrieve any personal information of an
                        individual cyclist.
                    </p>
                    <p>
                        The data publishing will be done based on the principle of
                        differential privacy, which is a system for publicly sharing
                        information about a dataset by describing the patterns of groups
                        within the dataset while withholding information about individuals
                        in the dataset. This basically means that data will only be
                        published if a particular individual's information cannot be
                        retrieved.
                    </p>
                </Question>

                <Question question="Can I delete my data?">
                    <p>
                        Yes! Although you contribute your data in an anonymous way (we
                        don't ask for your name or any other information that identifies
                        you), you can ask us to extract your data from the Bike Data
                        Project platform. If you'd like to do so, please send us an email
                        to info@bikedataproject.org with the name of the app
                        you've used to contribute your data and, if possible, also the ID
                        number associated with your account in the app.
                    </p>
                </Question>

                <Question question="What data am I sharing?">
                    <p>
                        We collect your cycling GPS tracks — specifically where and when
                        you cycle. We do not collect any personal information such as your
                        name, age, or gender.
                    </p>
                </Question>

                <Question question="How do I get access to the open data?">
                    <p>
                        The anonymous aggregated cycling data is available as open data.
                        You can explore the data on our <a href="/datamap" class="text-primary underline hover:text-primary-hover">data map</a>
                        or access the raw datasets on <a href="https://data.bikedataproject.org/" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-hover">data.bikedataproject.org</a>.
                        The data can be freely used by anyone under a Creative Commons license.
                    </p>
                </Question>

                <Question question="I'd love to be more involved in this project - how can I help?">
                    <p>
                        That's awesome! Check out our
                        <a
                            href="https://github.com/bikedataproject"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-primary underline hover:text-primary-hover"
                        >GitHub</a>
                        — all our code is open source and contributions are welcome.
                        You can also help by spreading the word and encouraging fellow
                        cyclists to share their data.
                    </p>
                </Question>
            </div>
        </div>
    </section>
</div>
<Footer />
