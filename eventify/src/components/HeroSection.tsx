import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const rotatingWords = ['events', 'concerts', 'meetups', 'festivals', 'workshops', 'parties'];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    eventsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 bg-white relative">
      {/* Realtime Clock - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-24 md:top-28 right-4 md:right-8 flex flex-col items-end gap-1"
      >
        <div className="flex items-center gap-2 border border-black px-3 py-2 bg-white">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-wider">Live</span>
        </div>
        <div className="text-right">
          <p className="text-2xl md:text-3xl font-medium tabular-nums">
            {format(currentTime, 'HH:mm:ss')}
          </p>
          <p className="text-xs md:text-sm text-black/60">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </motion.div>
      {/* Main content */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline with bordered boxes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="border border-black px-4 md:px-6 py-2 md:py-3"
              >
                Discover
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-[#E85A6B] border border-black px-4 md:px-6 py-2 md:py-3 rounded-full overflow-hidden min-w-[140px] md:min-w-[200px] relative text-white"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[currentWordIndex]}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    className="inline-block"
                  >
                    {rotatingWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </div>
            <div className="inline-flex flex-wrap items-center justify-center gap-0 mt-2 md:mt-3">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="border border-black px-4 md:px-6 py-2 md:py-3"
              >
                near
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="border border-black border-l-0 px-4 md:px-6 py-2 md:py-3"
              >
                you
              </motion.span>
            </div>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-base md:text-lg text-black/70 max-w-xl mx-auto mb-10 md:mb-14"
        >
          Explore popular events near you, browse by category, or check out some of the great community calendars.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToEvents}
            className="group relative overflow-hidden bg-black text-white px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-[#E85A6B] hover:text-white"
          >
            Browse Events
          </button>
          <button
            onClick={() => navigate('/organizer-landing')}
            className="border border-black px-8 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-black hover:text-white"
          >
            Want to Host Events?
          </button>
        </motion.div>
      </div>
    </section>
  );
};
