"""Generate a messy sample in the shape of the CMS Timely & Effective Care file.

Real source: see fetch.py. This stand-in reproduces the schema and the specific
defects of the CMS file so clean.py can be reviewed without a download.

The defects here are the ones that actually characterise CMS public files:

  - LONG format: one row per facility *per measure*, not one row per facility
  - Score is a text column carrying numbers, "Not Available", and blanks
  - Footnote codes explain *why* a value is missing, and mean different things
    (5 = too few cases to report, 1 = not available, 25 = did not submit)
  - measures mix units: minutes for throughput, percent for LWBS
  - facility names drift; the ID is the only stable key
  - state-level benchmark rows are mixed in with facility rows

    python make_sample.py --facilities 120
"""

import argparse
import csv
import random

COLUMNS = [
    "Facility ID", "Facility Name", "Address", "City/Town", "State", "ZIP Code",
    "County/Parish", "Condition", "Measure ID", "Measure Name", "Score",
    "Sample", "Footnote", "Start Date", "End Date",
]

MEASURES = [
    # id, name, condition, unit, typical, spread
    ("OP_18b", "Average (median) time patients spent in the emergency department "
               "before leaving from the visit", "Emergency Department", "min", 165, 55),
    ("OP_18c", "Average (median) time patients spent in the emergency department "
               "before leaving from the visit - Psychiatric/Mental Health Patients",
     "Emergency Department", "min", 310, 140),
    ("OP_22", "Left without being seen", "Emergency Department", "pct", 2.4, 1.9),
    ("ED_2b", "Average (median) time patients spent in the emergency department "
              "after the doctor decided to admit them",
     "Emergency Department", "min", 118, 62),
    ("OP_23", "Percentage of patients who came to the emergency department with "
              "stroke symptoms who received brain scan results within 45 minutes",
     "Emergency Department", "pct", 68, 18),
]

STATES = ["IA", "IL", "MN", "MO", "NE", "WI", "KS", "SD"]
CITY_A = ["Cedar", "Prairie", "River", "Grand", "Fair", "Elk", "Pine", "North"]
CITY_B = ["Falls", "View", "Grove", "Rapids", "Bluff", "Haven", "Ridge", "Junction"]
FAC_B = ["Regional Medical Center", "Community Hospital", "Health System",
         "Memorial Hospital", "Medical Center", "County Hospital"]

# Footnote codes carry meaning. Treating them all as "missing" throws away the
# distinction between "too few patients" and "didn't submit" — and only one of
# those is a data-quality problem worth telling the client about.
FOOTNOTES = ["1", "3", "5", "25", ""]

START, END = "01/01/2025", "12/31/2025"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--facilities", type=int, default=120)
    ap.add_argument("--out", default="raw/timely_care.csv")
    ap.add_argument("--seed", type=int, default=23)
    args = ap.parse_args()

    rng = random.Random(args.seed)
    rows: list[dict] = []

    facilities = []
    for i in range(args.facilities):
        fid = f"{rng.choice(['16', '14', '24', '26', '28', '52', '17', '43'])}{i:04d}"
        city = f"{rng.choice(CITY_A)} {rng.choice(CITY_B)}"
        name = f"{city} {rng.choice(FAC_B)}"
        state = rng.choice(STATES)
        # Site "personality": some facilities are congested across every measure.
        congestion = rng.lognormvariate(0, 0.28)
        facilities.append((fid, name, city, state, congestion))

    for fid, name, city, state, congestion in facilities:
        for mid, mname, cond, unit, typical, spread in MEASURES:
            # ~9% of facility/measure pairs have no reportable value.
            suppressed = rng.random() < 0.09

            if suppressed:
                score = rng.choice(["Not Available", "Not Available", ""])
                footnote = rng.choice(["5", "5", "1", "25"])
                sample = ""
            else:
                if unit == "min":
                    value = max(20, rng.gauss(typical * congestion, spread))
                    score = str(int(round(value)))
                else:
                    # LWBS rises with congestion; stroke-scan compliance falls.
                    direction = congestion if mid == "OP_22" else 1 / congestion
                    value = max(0.0, rng.gauss(typical * direction, spread))
                    score = f"{value:.1f}" if mid == "OP_22" else str(int(round(value)))
                footnote = ""
                sample = str(rng.randint(120, 4200))

            # Facility name drifts between rows — the ID is the only stable key.
            display = name
            r = rng.random()
            if r < 0.06:
                display = name.upper()
            elif r < 0.10:
                display = name + " "
            elif r < 0.13:
                display = name.replace("Medical Center", "Med Ctr")

            rows.append({
                "Facility ID": fid, "Facility Name": display,
                "Address": f"{rng.randint(100, 9999)} {rng.choice(CITY_A)} St",
                "City/Town": city, "State": state,
                "ZIP Code": f"{rng.randint(50000, 58999)}",
                "County/Parish": f"{rng.choice(CITY_A)}",
                "Condition": cond, "Measure ID": mid, "Measure Name": mname,
                "Score": score, "Sample": sample, "Footnote": footnote,
                "Start Date": START, "End Date": END,
            })

    # --- State benchmark rows, mixed into the same file ------------------
    # These have no Facility ID. Summing Score without excluding them
    # double-counts the state into its own average.
    for state in STATES:
        for mid, mname, cond, unit, typical, _ in MEASURES:
            rows.append({
                "Facility ID": "", "Facility Name": f"{state} STATE AVERAGE",
                "Address": "", "City/Town": "", "State": state,
                "ZIP Code": "", "County/Parish": "", "Condition": cond,
                "Measure ID": mid, "Measure Name": mname,
                "Score": str(int(typical)) if unit == "min" else f"{typical:.1f}",
                "Sample": "", "Footnote": "", "Start Date": START, "End Date": END,
            })

    rng.shuffle(rows)

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows):,} long-format rows to {args.out} "
          f"({args.facilities} facilities x {len(MEASURES)} measures + benchmarks)")
    print("Next: python clean.py")


if __name__ == "__main__":
    main()
