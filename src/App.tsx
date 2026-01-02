import { useState, useCallback } from "react";
import { provinces } from "./data/provinces";
import ProvinceSelector from "./components/ProvinceSelector";
import ResultsDisplay from "./components/ResultsDisplay";
import TypeWriter from "./components/TypeWriter";

type Step = "voting-province" | "feb8-location" | "feb1-location" | "results";

interface UserAnswers {
  votingProvince: string | null;
  feb8Location: "same" | "other" | null;
  feb8Province: string | null;
  feb1Location: "same-voting" | "same-feb8" | "other" | null;
  feb1Province: string | null;
}

function App() {
  const [step, setStep] = useState<Step>("voting-province");
  const [typingComplete, setTypingComplete] = useState(false);
  const [answers, setAnswers] = useState<UserAnswers>({
    votingProvince: null,
    feb8Location: null,
    feb8Province: null,
    feb1Location: null,
    feb1Province: null,
  });

  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);
  }, []);

  const handleVotingProvinceSelect = (province: string) => {
    setAnswers({ ...answers, votingProvince: province });
    setTypingComplete(false);
    setStep("feb8-location");
  };

  const handleFeb8LocationSelect = (
    location: "same" | "other",
    province?: string
  ) => {
    setAnswers({
      ...answers,
      feb8Location: location,
      feb8Province:
        location === "same" ? answers.votingProvince : province || null,
    });
    setTypingComplete(false);
    if (location === "same") {
      setStep("results");
    } else {
      setStep("feb1-location");
    }
  };

  const handleFeb1LocationSelect = (
    location: "same-voting" | "same-feb8" | "other",
    province?: string
  ) => {
    let feb1Province = null;
    if (location === "same-voting") {
      feb1Province = answers.votingProvince;
    } else if (location === "same-feb8") {
      feb1Province = answers.feb8Province;
    } else {
      feb1Province = province || null;
    }

    setAnswers({
      ...answers,
      feb1Location: location,
      feb1Province,
    });
    setTypingComplete(false);
    setStep("results");
  };

  const handleReset = () => {
    setAnswers({
      votingProvince: null,
      feb8Location: null,
      feb8Province: null,
      feb1Location: null,
      feb1Province: null,
    });
    setTypingComplete(false);
    setStep("voting-province");
  };

  const handleBack = () => {
    setTypingComplete(false);
    if (step === "feb8-location") {
      setStep("voting-province");
    } else if (step === "feb1-location") {
      setStep("feb8-location");
    } else if (step === "results") {
      if (answers.feb8Location === "same") {
        setStep("feb8-location");
      } else {
        setStep("feb1-location");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-election-dark via-election-primary to-election-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-election-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-election-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-election-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center py-8 px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 animate-fade-in font-heading flex items-center justify-center gap-3">
            <span className="material-icons text-4xl md:text-5xl">
              how_to_vote
            </span>
            จะไปเลือกตั้งและออกเสียงประชามติยังไงดี?
          </h1>
          <p
            className="text-election-secondary text-xl animate-fade-in font-body"
            style={{ animationDelay: "0.1s" }}
          >
            เลือกตั้งทั่วไป 2569 & ประชามติแก้รัฐธรรมนูญ
          </p>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-start justify-center px-4 pb-8">
          <div className="w-full max-w-2xl">
            {/* Progress indicator */}
            {step !== "results" && (
              <div className="flex justify-center gap-2 mb-8 animate-fade-in">
                {["voting-province", "feb8-location", "feb1-location"].map(
                  (s, i) => {
                    const stepIndex = [
                      "voting-province",
                      "feb8-location",
                      "feb1-location",
                    ].indexOf(step);
                    const isActive = s === step;
                    const isPast = i < stepIndex;
                    const shouldShow =
                      s !== "feb1-location" || answers.feb8Location === "other";

                    if (!shouldShow) return null;

                    return (
                      <div
                        key={s}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-election-secondary scale-125"
                            : isPast
                            ? "bg-election-secondary/60"
                            : "bg-white/30"
                        }`}
                      />
                    );
                  }
                )}
              </div>
            )}

            {/* Step content */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20">
              {step === "voting-province" && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 font-heading">
                    <TypeWriter
                      text="คุณมีสิทธิเลือกตั้งอยู่ในจังหวัดใด?"
                      speed={40}
                      onComplete={handleTypingComplete}
                    />
                  </h2>
                  <div
                    className={`transition-all duration-500 ${
                      typingComplete
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    {/* <p className="text-white/80 mb-6 text-base">
                      ไม่แน่ใจ?{" "}
                      <a
                        href="https://stat.bora.dopa.go.th/Election/enqelectaliasaliasaliasaliaseligible/#/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-election-secondary hover:text-election-secondary/80 underline transition-colors inline-flex items-center gap-1"
                      >
                        <span className="material-icons text-base">
                          open_in_new
                        </span>
                        ตรวจสอบสิทธิ์ที่นี่
                      </a>
                    </p> */}
                    <ProvinceSelector
                      provinces={[...provinces]}
                      onSelect={handleVotingProvinceSelect}
                      selectedProvince={answers.votingProvince}
                    />
                  </div>
                </div>
              )}

              {step === "feb8-location" && (
                <div>
                  <button
                    onClick={handleBack}
                    className="text-white/70 hover:text-white mb-4 flex items-center gap-1 transition-colors text-base"
                  >
                    <span className="material-icons text-xl">arrow_back</span>
                    ย้อนกลับ
                  </button>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 font-heading">
                    <TypeWriter
                      text="ในวันที่ 8 กุมภาพันธ์ 2569 คุณจะอยู่ที่จังหวัดใด?"
                      speed={40}
                      onComplete={handleTypingComplete}
                    />
                  </h2>

                  <div
                    className={`space-y-4 transition-all duration-500 ${
                      typingComplete
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <button
                      onClick={() => handleFeb8LocationSelect("same")}
                      className="w-full p-5 rounded-xl bg-white/10 hover:bg-election-secondary/30 border border-white/20 hover:border-election-secondary text-white text-left transition-all duration-300"
                    >
                      <span className="text-xl flex items-center gap-2">
                        <span className="material-icons">location_on</span>
                        อยู่ที่{answers.votingProvince}
                      </span>
                      <span className="block text-base text-white/70 mt-2">
                        จังหวัดเดียวกับที่มีสิทธิเลือกตั้ง
                      </span>
                    </button>

                    <div className="relative">
                      <div className="text-white/70 text-center my-4 text-base">
                        หรือ
                      </div>
                      <div className="text-white mb-3 text-lg flex items-center gap-2">
                        <span className="material-icons">directions_car</span>
                        อยู่จังหวัดอื่น
                      </div>
                      <ProvinceSelector
                        provinces={[...provinces].filter(
                          (p) => p !== answers.votingProvince
                        )}
                        onSelect={(province) =>
                          handleFeb8LocationSelect("other", province)
                        }
                        selectedProvince={answers.feb8Province}
                        placeholder="เลือกจังหวัดที่จะอยู่"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === "feb1-location" && (
                <div>
                  <button
                    onClick={handleBack}
                    className="text-white/70 hover:text-white mb-4 flex items-center gap-1 transition-colors text-base"
                  >
                    <span className="material-icons text-xl">arrow_back</span>
                    ย้อนกลับ
                  </button>
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 font-heading">
                    <TypeWriter
                      text="ในวันที่ 1 กุมภาพันธ์ 2569 คุณจะอยู่ที่จังหวัดใด?"
                      speed={40}
                      onComplete={handleTypingComplete}
                    />
                  </h2>
                  <div
                    className={`transition-all duration-500 ${
                      typingComplete
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <p className="text-white/70 mb-6 text-base">
                      วันเลือกตั้งล่วงหน้า/นอกเขต
                    </p>

                    <div className="space-y-4">
                      <button
                        onClick={() => handleFeb1LocationSelect("same-voting")}
                        className="w-full p-5 rounded-xl bg-white/10 hover:bg-election-secondary/30 border border-white/20 hover:border-election-secondary text-white text-left transition-all duration-300"
                      >
                        <span className="text-xl flex items-center gap-2">
                          <span className="material-icons">location_on</span>
                          อยู่ที่{answers.votingProvince}
                        </span>
                        <span className="block text-base text-white/70 mt-2">
                          จังหวัดเดียวกับที่มีสิทธิเลือกตั้ง
                        </span>
                      </button>

                      <button
                        onClick={() => handleFeb1LocationSelect("same-feb8")}
                        className="w-full p-5 rounded-xl bg-white/10 hover:bg-election-secondary/30 border border-white/20 hover:border-election-secondary text-white text-left transition-all duration-300"
                      >
                        <span className="text-xl flex items-center gap-2">
                          <span className="material-icons">location_on</span>
                          อยู่ที่{answers.feb8Province}
                        </span>
                        <span className="block text-base text-white/70 mt-2">
                          จังหวัดเดียวกับที่จะอยู่วันที่ 8 ก.พ.
                        </span>
                      </button>

                      <div className="relative">
                        <div className="text-white/70 text-center my-4 text-base">
                          หรือ
                        </div>
                        <div className="text-white mb-3 text-lg flex items-center gap-2">
                          <span className="material-icons">directions_car</span>
                          อยู่จังหวัดอื่น
                        </div>
                        <ProvinceSelector
                          provinces={[...provinces].filter(
                            (p) =>
                              p !== answers.votingProvince &&
                              p !== answers.feb8Province
                          )}
                          onSelect={(province) =>
                            handleFeb1LocationSelect("other", province)
                          }
                          selectedProvince={answers.feb1Province}
                          placeholder="เลือกจังหวัดที่จะอยู่"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === "results" && (
                <ResultsDisplay answers={answers} onReset={handleReset} />
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-white/50 text-sm">
          Made with{" "}
          <span className="material-icons text-red-400 text-sm align-middle">
            favorite
          </span>{" "}
          by{" "}
          <a
            href="https://x.com/PanJ"
            target="_blank"
            rel="noopener noreferrer"
            className="text-election-secondary/70 hover:text-election-secondary transition-colors"
          >
            @PanJ
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
