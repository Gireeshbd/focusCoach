"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionModalProps {
  isOpen: boolean;
  duration: number;
  onComplete: (reflection: {
    focusQuality: number;
    focusDepth: string;
    whatDistracted: string;
    whatsNext: string;
  }) => void;
}

export default function ReflectionModal({
  isOpen,
  duration,
  onComplete,
}: ReflectionModalProps) {
  const [focusQuality, setFocusQuality] = useState(7);
  const [focusDepth, setFocusDepth] = useState("");
  const [whatDistracted, setWhatDistracted] = useState("");
  const [whatsNext, setWhatsNext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      focusQuality,
      focusDepth,
      whatDistracted,
      whatsNext,
    });
  };

  const durationMinutes = Math.floor(duration / 60000);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-card rounded-3xl shadow-2xl border-2 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b-2 border-border bg-gradient-to-br from-secondary/20 via-accent/15 to-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-success/5 to-transparent" />
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-success to-success/80 rounded-xl shadow-lg">
                    <Sparkles className="text-success-foreground" size={32} />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-br from-card-foreground to-card-foreground/70 bg-clip-text text-transparent">
                    Session Complete!
                  </h2>
                </div>
                <p className="text-base text-muted-foreground font-medium relative">
                  You focused for <span className="font-bold text-success text-lg">{durationMinutes} minutes</span>.
                  Let's reflect on your session.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Focus Quality Rating */}
                <div>
                  <label className="block text-xl font-bold mb-5 text-card-foreground">
                    How deep was your focus?
                  </label>
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <motion.button
                        key={rating}
                        type="button"
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFocusQuality(rating)}
                        className={cn(
                          "w-12 h-12 rounded-full font-bold transition-all flex items-center justify-center shadow-md",
                          rating <= focusQuality
                            ? rating <= 3
                              ? "bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground scale-110 shadow-lg"
                              : rating <= 7
                              ? "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground scale-110 shadow-lg"
                              : "bg-gradient-to-br from-success to-success/80 text-success-foreground scale-110 shadow-lg"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {rating}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground font-semibold">
                    <span>😔 Distracted</span>
                    <span>🚀 Deep Flow</span>
                  </div>
                </div>

                {/* Focus Depth */}
                <div>
                  <label
                    htmlFor="focusDepth"
                    className="block text-xl font-bold mb-4 text-card-foreground"
                  >
                    What did you accomplish?
                  </label>
                  <textarea
                    id="focusDepth"
                    value={focusDepth}
                    onChange={(e) => setFocusDepth(e.target.value)}
                    placeholder="Describe what you worked on and what you achieved..."
                    rows={3}
                    className="w-full px-5 py-4 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-base shadow-sm"
                  />
                </div>

                {/* Distractions */}
                <div>
                  <label
                    htmlFor="whatDistracted"
                    className="block text-xl font-bold mb-4 text-card-foreground"
                  >
                    What distracted you?
                  </label>
                  <textarea
                    id="whatDistracted"
                    value={whatDistracted}
                    onChange={(e) => setWhatDistracted(e.target.value)}
                    placeholder="Phone notifications, thoughts, noise, etc..."
                    rows={2}
                    className="w-full px-5 py-4 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-base shadow-sm"
                  />
                </div>

                {/* Next Steps */}
                <div>
                  <label
                    htmlFor="whatsNext"
                    className="block text-xl font-bold mb-4 text-card-foreground"
                  >
                    What's next?
                  </label>
                  <textarea
                    id="whatsNext"
                    value={whatsNext}
                    onChange={(e) => setWhatsNext(e.target.value)}
                    placeholder="What will you work on in your next session..."
                    rows={2}
                    className="w-full px-5 py-4 bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-base shadow-sm"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 border-2 border-primary/20"
                >
                  <Sparkles size={24} />
                  <span>Complete & Get AI Summary</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
