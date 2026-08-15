import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiHome,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";

function About() {
  return (
    <main className="bg-white text-slate-900">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="Modern home"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-sm">
              <FiHome size={13} />
              About EstateLanka
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Building a better way to discover property in Sri Lanka.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              EstateLanka is a Sri Lankan property platform built to bring
              property discovery, communication, and smarter decision-making
              together in one simple digital experience.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          OUR STORY
      ========================================================== */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-blue-600">Our Story</p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Created to make property discovery less complicated.
              </h2>

              <div className="mt-6 h-1 w-16 rounded-full bg-blue-600" />
            </div>

            <div className="space-y-5 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                Finding the right property is an important decision, but the
                process can often feel scattered. Property information may be
                spread across different platforms, making it difficult to
                compare options and communicate with the right people.
              </p>

              <p>
                EstateLanka was created with the idea of bringing that
                experience into one focused platform. Instead of making property
                discovery more complicated, we want technology to make it
                clearer and more convenient.
              </p>

              <p>
                The platform connects people looking for homes with people
                offering properties, while providing tools that help users
                understand their options and make more informed decisions.
              </p>

              <p>
                At its core, EstateLanka is about creating a more accessible
                digital property experience designed specifically with Sri Lanka
                in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MISSION & VISION
      ========================================================== */}
      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">Our Direction</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              What EstateLanka stands for
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              Our mission defines what we are building today, while our vision
              shapes where we want EstateLanka to go.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Mission */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiCheckCircle size={22} />
              </div>

              <p className="mt-7 text-sm font-semibold text-blue-600">
                Our Mission
              </p>

              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Make property discovery simpler, clearer, and more accessible.
              </h3>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Our mission is to create a reliable digital environment where
                people can discover properties, understand their options, and
                connect with property owners without unnecessary complexity.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                We aim to combine useful technology with a straightforward
                experience so that finding or listing a property feels more
                natural.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiBarChart2 size={22} />
              </div>

              <p className="mt-7 text-sm font-semibold text-blue-600">
                Our Vision
              </p>

              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Become a trusted digital destination for Sri Lankan property.
              </h3>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                We envision a future where people across Sri Lanka can
                confidently discover, compare, and connect around property
                through one dependable digital platform.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                As EstateLanka grows, our goal is to continue improving the
                experience through thoughtful technology, useful data, and a
                strong understanding of the local property market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BUILT FOR SRI LANKA
      ========================================================== */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=85"
                alt="Sri Lankan residential property"
                className="h-[420px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-slate-950/20" />

              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-blue-300">
                  <FiMapPin size={16} />

                  <span className="text-xs font-semibold">
                    Built for Sri Lanka
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-white">
                  Designed around the people, places, and property market of Sri
                  Lanka.
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Local by design
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                One platform for property across the island.
              </h2>

              <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
                Sri Lanka's property market is diverse, with different needs,
                locations, communities, and lifestyles across the country.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                EstateLanka is designed around that local context. From Colombo
                and Gampaha to Kandy, Galle, Jaffna, and other parts of the
                island, the platform is structured to help people discover
                properties in the places that matter to them.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-200 pt-7 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-bold text-slate-950">25</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Districts covered
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-950">2</p>
                  <p className="mt-1 text-xs text-slate-500">Property types</p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-950">2</p>
                  <p className="mt-1 text-xs text-slate-500">Sale & rental</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TECHNOLOGY
      ========================================================== */}
      <section className="bg-slate-950 py-20 text-white sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Technology with purpose
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Using technology where it creates real value.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                EstateLanka is more than a collection of property listings.
                Modern web technologies and data-driven approaches are used to
                create a platform that is practical, responsive, and useful.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                One example is our machine learning-powered property value
                estimation, designed to give sellers an additional reference
                when thinking about their property's potential value.
              </p>

              <p className="mt-4 text-xs leading-6 text-slate-500">
                Estimates are intended as a reference and should not be
                considered a professional property valuation.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <FiBarChart2 size={23} className="text-blue-400" />

                <h3 className="mt-5 text-lg font-semibold">
                  Data-driven decisions
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Data and machine learning can provide additional insight when
                  making property-related decisions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <FiShield size={23} className="text-blue-400" />

                <h3 className="mt-5 text-lg font-semibold">
                  Reliable experience
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  We focus on creating a clear and dependable experience across
                  the platform.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <FiUsers size={23} className="text-blue-400" />

                <h3 className="mt-5 text-lg font-semibold">People focused</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Technology should support people rather than make the process
                  more complicated.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <FiHome size={23} className="text-blue-400" />

                <h3 className="mt-5 text-lg font-semibold">Built to grow</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  EstateLanka is designed as a foundation that can evolve with
                  the needs of Sri Lanka's property market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================== */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">Our Values</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Principles behind EstateLanka.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              The platform is guided by a few principles that influence how we
              think about the product and the people who use it.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t-2 border-blue-600 pt-6">
              <FiShield size={22} className="text-blue-600" />

              <h3 className="mt-5 text-lg font-bold text-slate-950">Trust</h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                We believe property decisions should be supported by clear and
                understandable information.
              </p>
            </div>

            <div className="border-t-2 border-blue-600 pt-6">
              <FiCheckCircle size={22} className="text-blue-600" />

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Simplicity
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Useful technology should reduce complexity rather than create
                more of it.
              </p>
            </div>

            <div className="border-t-2 border-blue-600 pt-6">
              <FiUsers size={22} className="text-blue-600" />

              <h3 className="mt-5 text-lg font-bold text-slate-950">People</h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Buyers, sellers, and their needs remain at the centre of the
                platform.
              </p>
            </div>

            <div className="border-t-2 border-blue-600 pt-6">
              <FiBarChart2 size={22} className="text-blue-600" />

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Innovation
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                We explore modern technologies when they can create meaningful
                improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CLOSING
      ========================================================== */}
      <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">
            The EstateLanka journey
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            We are building more than a property platform.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            We are building a simpler digital experience for one of life's
            biggest decisions — finding a place to call home.
          </p>

          <div className="mt-8">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore EstateLanka
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
