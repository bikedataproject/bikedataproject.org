<script lang="ts">
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
</script>

<NavBar />

<div class="pt-16">
    <section class="relative mt-[200px] px-[8vw] mb-16">
        <p class="background-big-letter">Data</p>
        <div class="max-w-3xl">
            <h2>The data</h2>
            <p>
                The data collected by this project consists of contributions made by
                all different kinds of cyclists. All individual cycling data are
                aggregated into collective data. The collective data gives us patterns
                we can use to demonstrate where and when cyclists ride their bicycles.
            </p>
        </div>
    </section>

    <section class="mb-16">
        <iframe
            src="https://data.bikedataproject.org/map/#2.01/45/24.32"
            title="Data map"
            class="w-full h-[700px] max-h-[50vh]"
        ></iframe>
    </section>

    <section class="px-[8vw] mb-[200px]">
        <div class="max-w-3xl">
            <p class="mb-4">
                The anonymous aggregated cycling data will be opened up to the public
                as open data. The open data provided by the Bike Data Project platform
                can be freely used by different stakeholders and for different
                purposes. Here's a non-exhaustive list of different use cases of the
                open data:
            </p>
            <ul class="list-disc pl-6 space-y-2 mb-6">
                <li>
                    Transportation experts, city planners, mobility planners and urban
                    designers around the world need open data like this to help them
                    develop modern infrastructure and sustainable cities.
                </li>
                <li>
                    Citizens can get a high-level overview of the number of cyclists and
                    kilometers cycled in the city and check out a map with the number of
                    cyclists per route.
                </li>
                <li>
                    Civil society and journalists use the data to analyse the situation
                    for cyclists in the city, such as the amount of time cyclists lose
                    on average at traffic lights.
                </li>
                <li>
                    Data and software companies can dive into the data to obtain smart
                    cycling insights and build tools like advanced cycling route
                    planners and recommendation engines to improve cycling
                    infrastructure. The data can also be very useful for other bike
                    related products and services.
                </li>
            </ul>

            <div class="flex justify-center mt-[10vh]">
                <div class="text-center flex flex-col items-center gap-4">
                    <h3 class="text-2xl font-semibold">Have a look at our open source code</h3>
                    <a
                        href="https://github.com/bikedataproject"
                        class="inline-flex items-center gap-3 px-6 py-3 bg-[#36469d] text-white font-semibold rounded hover:bg-[#2a3580] transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 0C7.15983 0 0 7.26871 0 16.2433C0 23.877 5.15949 30.2125 12.1205 31.9986C12.0402 31.7954 12.0007 31.5106 12.0007 31.2272V28.4652H10.0003C8.92051 28.4652 7.91966 27.9786 7.47983 27.0842C6.95966 26.1096 6.87932 24.6069 5.55983 23.6724C5.15949 23.3475 5.47949 23.0226 5.91932 23.0627C6.75949 23.306 7.43898 23.8756 8.07898 24.7271C8.71898 25.5801 8.99949 25.7833 10.1991 25.7833C10.7588 25.7833 11.6385 25.7432 12.4391 25.6202C12.879 24.4825 13.6388 23.4678 14.5593 22.9812C9.19966 22.3314 6.63966 19.6509 6.63966 15.9959C6.63966 14.4116 7.31915 12.9089 8.43983 11.6095C8.08034 10.3501 7.59966 7.75117 8.60051 6.73648C11.0012 6.73648 12.4405 8.32072 12.8 8.72576C13.9997 8.31934 15.3205 8.07603 16.6795 8.07603C18.0793 8.07603 19.3593 8.31934 20.559 8.72576C20.9185 8.31934 22.3591 6.73648 24.7585 6.73648C25.7185 7.71108 25.2786 10.3501 24.8783 11.6095C25.999 12.8688 26.639 14.4116 26.639 15.9959C26.639 19.6509 24.1185 22.3314 18.7997 22.8996C20.2798 23.671 21.3202 25.8635 21.3202 27.4878V31.1871C21.3202 31.3088 21.2807 31.4304 21.2807 31.5521C27.52 29.3596 32 23.3503 32 16.2433C32 7.26871 24.8402 0 16 0Z" fill="white"/>
                        </svg>
                        Github
                    </a>
                </div>
            </div>
        </div>
    </section>
</div>
<Footer />
