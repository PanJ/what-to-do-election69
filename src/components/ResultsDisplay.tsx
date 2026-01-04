import { useState, useEffect } from "react";
import { provincesWithSingleArea } from "../data/provinces";

interface UserAnswers {
  votingProvince: string | null;
  feb8Location: "same" | "other" | null;
  feb8Province: string | null;
  feb1Location: "same-voting" | "same-feb8" | "other" | null;
  feb1Province: string | null;
}

interface ResultsDisplayProps {
  answers: UserAnswers;
  onReset: () => void;
}

interface VotingResult {
  type: "election" | "referendum";
  title: string;
  date: string;
  needsRegistration: boolean;
  registrationType: "early" | "outside" | null;
  location: string | null;
  icon: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function useCountdown(targetDate: Date): TimeRemaining {
  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeRemaining;
}

// January 5, 2026 23:59:59 Thai time (UTC+7)
// In UTC: January 5, 2026 16:59:59
const REGISTRATION_DEADLINE = new Date("2026-01-05T23:59:59+07:00");

function CountdownDisplay({ timeRemaining }: { timeRemaining: TimeRemaining }) {
  if (timeRemaining.expired) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-base mt-2">
        <span className="material-icons text-sm">timer_off</span>
        <span>หมดเวลาลงทะเบียนแล้ว</span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="material-icons text-election-secondary text-lg">
        timer
      </span>
      <div className="flex gap-2 text-sm flex-wrap">
        <div className="bg-election-dark/60 px-2 py-1 rounded-lg text-center min-w-[50px]">
          <span className="text-white font-mono font-bold text-lg">
            {timeRemaining.days}
          </span>
          <span className="text-white/60 text-xs ml-1">วัน</span>
        </div>
        <div className="bg-election-dark/60 px-2 py-1 rounded-lg text-center min-w-[50px]">
          <span className="text-white font-mono font-bold text-lg">
            {String(timeRemaining.hours).padStart(2, "0")}
          </span>
          <span className="text-white/60 text-xs ml-1">ชม.</span>
        </div>
        <div className="bg-election-dark/60 px-2 py-1 rounded-lg text-center min-w-[50px]">
          <span className="text-white font-mono font-bold text-lg">
            {String(timeRemaining.minutes).padStart(2, "0")}
          </span>
          <span className="text-white/60 text-xs ml-1">นาที</span>
        </div>
        <div className="bg-election-dark/60 px-2 py-1 rounded-lg text-center min-w-[50px]">
          <span className="text-white font-mono font-bold text-lg">
            {String(timeRemaining.seconds).padStart(2, "0")}
          </span>
          <span className="text-white/60 text-xs ml-1">วินาที</span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({
  answers,
  onReset,
}: ResultsDisplayProps) {
  const { votingProvince, feb8Location, feb8Province, feb1Province } = answers;

  // Check if user votes on Feb 1 at the same province as voting province
  const votesAtSameProvinceOnFeb1 =
    feb8Location !== "same" && feb1Province === votingProvince;
  const isSingleAreaProvince =
    votingProvince && provincesWithSingleArea.includes(votingProvince);

  // Calculate results
  const results: VotingResult[] = [];

  // Election logic
  if (feb8Location === "same") {
    // User is in their voting province on Feb 8
    results.push({
      type: "election",
      title: "การเลือกตั้งทั่วไป",
      date: "8 กุมภาพันธ์ 2569",
      needsRegistration: false,
      registrationType: null,
      location: votingProvince,
      icon: "how_to_vote",
    });
  } else {
    // User is NOT in their voting province on Feb 8
    // They need to vote early/outside on Feb 1
    // If voting at same province and it's single area, don't show location
    const electionLocation =
      votesAtSameProvinceOnFeb1 && isSingleAreaProvince ? null : feb1Province;

    results.push({
      type: "election",
      title: "การเลือกตั้งทั่วไป (ล่วงหน้า/นอกเขต)",
      date: "1 กุมภาพันธ์ 2569",
      needsRegistration: true,
      registrationType: "early",
      location: electionLocation,
      icon: "how_to_vote",
    });
  }

  // Referendum logic
  // Referendum has NO early voting, only outside voting on Feb 8
  if (feb8Location === "same") {
    results.push({
      type: "referendum",
      title: "การออกเสียงประชามติ",
      date: "8 กุมภาพันธ์ 2569",
      needsRegistration: false,
      registrationType: null,
      location: votingProvince,
      icon: "description",
    });
  } else {
    // Need to vote at feb8Province (outside voting)
    results.push({
      type: "referendum",
      title: "การออกเสียงประชามติ (นอกเขต)",
      date: "8 กุมภาพันธ์ 2569",
      needsRegistration: true,
      registrationType: "outside",
      location: feb8Province,
      icon: "description",
    });
  }

  const needsElectionRegistration = results.some(
    (r) => r.type === "election" && r.needsRegistration
  );
  const needsReferendumRegistration = results.some(
    (r) => r.type === "referendum" && r.needsRegistration
  );

  const timeRemaining = useCountdown(REGISTRATION_DEADLINE);

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 text-center font-heading flex items-center justify-center gap-2">
        <span className="material-icons text-3xl">checklist</span>
        สรุปสิ่งที่ต้องทำ
      </h2>
      <p className="text-white/70 text-center mb-6 text-base">
        บันทึกหน้าจอนี้ไว้เพื่อไม่ลืม!
      </p>

      {/* Summary box */}
      <div className="bg-election-dark/50 rounded-2xl p-3 md:p-5 mb-6 border border-election-secondary/30">
        <div className="text-white/70 text-base mb-2">
          จังหวัดที่มีสิทธิเลือกตั้ง
        </div>
        <div className="text-white text-xl font-medium font-heading">
          {votingProvince}
        </div>
      </div>

      {/* Results cards */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result.type}
            className="bg-white/5 rounded-2xl p-3 md:p-5 border border-white/10 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="text-election-secondary">
                  <span className="material-icons text-5xl">{result.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 font-heading">
                  {result.title}
                </h3>
              </div>

              <div className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-election-secondary text-lg">
                    <span className="material-icons">event</span>
                    <span className="font-medium">{result.date}</span>
                  </div>
                  {result.location && (
                    <div className="flex items-center gap-2 text-white/90 text-lg">
                      <span className="material-icons">location_on</span>
                      <span>{result.location}</span>
                    </div>
                  )}
                  {result.needsRegistration && (
                    <div className="mt-3 p-4 bg-election-accent/80 rounded-xl border border-election-accent/30">
                      <div className="flex items-center gap-2 text-white font-medium text-lg">
                        <span className="material-icons">warning</span>
                        <span>
                          ต้องลงทะเบียน
                          {result.type === "election"
                            ? "เลือกตั้ง"
                            : "ประชามติ"}
                          {result.registrationType === "outside"
                            ? "นอกเขต"
                            : "ล่วงหน้า/นอกเขต"}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Warning for voting at same province on Feb 1 */}
                  {result.type === "election" && votesAtSameProvinceOnFeb1 && (
                    <div className="mt-3 p-4 bg-amber-500/20 rounded-xl border border-amber-500/40">
                      <div className="flex items-start gap-2 text-amber-300">
                        <span className="material-icons mt-0.5">info</span>
                        <span className="text-base">
                          {!isSingleAreaProvince
                            ? `โดยทั่วไปแล้ว คุณไม่สามารถเลือกตั้งล่วงหน้าในเขตที่คุณมีสิทธิเลือกตั้งได้ คุณต้องลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขตเท่านั้น โดยคุณสามารถเลือกเขตเลือกตั้งที่ใกล้ที่สุดที่ไม่ใช่เขตที่คุณมีสิทธิเลือกตั้งอยู่`
                            : `โดยทั่วไปแล้ว คุณไม่สามารถเลือกตั้งล่วงหน้าในเขตที่คุณมีสิทธิเลือกตั้งได้ คุณต้องลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขตเท่านั้น โดยคุณสามารถเลือกเขตเลือกตั้งที่ใกล้ที่สุดที่ไม่ใช่เขตที่คุณมีสิทธิเลือกตั้งอยู่ และเนื่องจากจังหวัด${votingProvince} มีเขตเลือกตั้งเดียว คุณต้องลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขตที่จังหวัดข้างเคียง`}
                        </span>
                      </div>
                    </div>
                  )}
                  {result.type === "referendum" && result.needsRegistration && (
                    <div className="mt-3 p-4 bg-amber-500/20 rounded-xl border border-amber-500/40">
                      <div className="flex items-start gap-2 text-amber-300">
                        <span className="material-icons mt-0.5">info</span>
                        <span className="text-base">
                          การลงทะเบียนประชามตินอกเขต
                          จะทำแยกกันกับการลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขต
                          หากคุณได้ทำการลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขตก่อนวันที่
                          3 ธันวาคม 2569
                          คุณต้องลงทะเบียนประชามตินอกเขตอีกครั้งหนึ่ง
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning for voting both on Feb 8 */}
      {feb8Location === "same" && (
        <div
          className="mt-6 p-3 md:p-5 bg-amber-500/20 rounded-2xl border border-amber-500/40 animate-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex items-start gap-3">
            <span className="material-icons text-amber-400 text-3xl">info</span>
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-2 font-heading">
                โปรดระวัง!
              </h3>
              <p className="text-white/90 text-base">
                คุณต้องเข้าคูหาสองรอบ เพื่อที่จะทำการลงคะแนนเสียงเลือกตั้ง
                และการลงคะแนนเสียงประชามติ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registration links */}
      {(needsElectionRegistration || needsReferendumRegistration) && (
        <div
          className="mt-6 p-3 md:p-5 bg-election-secondary/20 rounded-2xl border border-election-secondary/30 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2 font-heading">
            <span className="material-icons">edit_note</span>
            ลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขต และลงทะเบียนประชามตินอกเขต
          </h3>
          <p className="text-white/80 text-base mb-2">
            ลงทะเบียนได้ถึงวันที่ 5 มกราคม 2569
          </p>
          <CountdownDisplay timeRemaining={timeRemaining} />
          <a
            href="https://boraservices.bora.dopa.go.th/election/outvote/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-election-secondary text-election-dark px-5 py-3 rounded-xl font-medium hover:bg-election-secondary/90 transition-colors text-lg mt-4"
          >
            <span className="material-icons">open_in_new</span>
            ลงทะเบียนที่นี่
          </a>
        </div>
      )}

      {/* Important dates */}
      <div
        className="mt-6 p-3 md:p-5 bg-white/5 rounded-2xl border border-white/10 animate-slide-up"
        style={{ animationDelay: "0.4s" }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 font-heading">
          <span className="material-icons">calendar_month</span>
          วันสำคัญ
        </h3>
        <div className="space-y-3 text-white/90 text-base">
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 gap-1">
            <span className="flex-1">
              วันสุดท้ายของการลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขต
              และการลงทะเบียนประชามตินอกเขต
            </span>
            <span className="text-election-secondary font-medium w-[110px]">
              5 ม.ค. 2569
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 gap-1">
            <span className="flex-1">วันเลือกตั้งล่วงหน้า/นอกเขต</span>
            <span className="text-election-secondary font-medium w-[110px]">
              1 ก.พ. 2569
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 gap-1">
            <span className="flex-1">วันเลือกตั้งทั่วไป & ประชามติ</span>
            <span className="text-election-secondary font-medium w-[110px]">
              8 ก.พ. 2569
            </span>
          </div>
        </div>
      </div>

      {/* Check rights link */}
      {/* <div
        className="mt-6 text-center animate-slide-up"
        style={{ animationDelay: "0.5s" }}
      >
        <a
          href="https://stat.bora.dopa.go.th/Election/enqelectaliasaliasaliasaliaseligible/#/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white text-base underline transition-colors inline-flex items-center gap-1"
        >
          <span className="material-icons text-base">search</span>
          ตรวจสอบสิทธิ์การเลือกตั้ง
        </a>
      </div> */}

      {/* Reset button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-lg inline-flex items-center gap-2"
        >
          <span className="material-icons">refresh</span>
          เริ่มใหม่
        </button>
      </div>
    </div>
  );
}
