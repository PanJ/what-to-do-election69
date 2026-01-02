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

export default function ResultsDisplay({
  answers,
  onReset,
}: ResultsDisplayProps) {
  const { votingProvince, feb8Location, feb8Province, feb1Province } = answers;

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
    const electionLocation = feb1Province;

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
      <div className="bg-election-dark/50 rounded-2xl p-5 mb-6 border border-election-secondary/30">
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
            className="bg-white/5 rounded-2xl p-5 border border-white/10 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-election-secondary">
                <span className="material-icons text-5xl">{result.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2 font-heading">
                  {result.title}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-election-secondary text-lg">
                    <span className="material-icons">event</span>
                    <span className="font-medium">{result.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-lg">
                    <span className="material-icons">location_on</span>
                    <span>{result.location}</span>
                  </div>
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration links */}
      {needsElectionRegistration && (
        <div
          className="mt-6 p-5 bg-election-secondary/20 rounded-2xl border border-election-secondary/30 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2 font-heading">
            <span className="material-icons">edit_note</span>
            ลงทะเบียนเลือกตั้งล่วงหน้า/นอกเขต
          </h3>
          <p className="text-white/80 text-base mb-4">
            ลงทะเบียนได้ถึงวันที่ 5 มกราคม 2569
          </p>
          <a
            href="https://boraservices.bora.dopa.go.th/election/outvote/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-election-secondary text-election-dark px-5 py-3 rounded-xl font-medium hover:bg-election-secondary/90 transition-colors text-lg"
          >
            <span className="material-icons">open_in_new</span>
            ลงทะเบียนที่นี่
          </a>
        </div>
      )}
      {needsReferendumRegistration && (
        <div
          className="mt-6 p-5 bg-election-secondary/20 rounded-2xl border border-election-secondary/30 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2 font-heading">
            <span className="material-icons">edit_note</span>
            ลงทะเบียนประชามตินอกเขต
          </h3>
          <p className="text-white/80 text-base mb-4">
            ลงทะเบียนได้ตั้งแต่วันเสาร์ที่ 3 มกราคม 2569 จนถึงวันจันทร์ที่ 5
            มกราคม 2569
          </p>
          <button
            disabled
            className="inline-flex items-center gap-2 bg-white/20 text-white/60 px-5 py-3 rounded-xl font-medium cursor-not-allowed text-lg"
          >
            <span className="material-icons">hourglass_empty</span>
            อยู่ระหว่างการรอช่องทางการลงทะเบียน
          </button>
        </div>
      )}

      {/* Important dates */}
      <div
        className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/10 animate-slide-up"
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
            <span className="text-election-secondary font-medium w-[150px]">
              5 ม.ค. 2569
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 gap-1">
            <span className="flex-1">วันเลือกตั้งล่วงหน้า/นอกเขต</span>
            <span className="text-election-secondary font-medium w-[150px]">
              1 ก.พ. 2569
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 gap-1">
            <span className="flex-1">วันเลือกตั้งทั่วไป & ประชามติ</span>
            <span className="text-election-secondary font-medium w-[150px]">
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
