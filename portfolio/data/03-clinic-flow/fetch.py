"""Pull CMS 'Timely and Effective Care - Hospital' facility measures.

Run on your own machine — needs outbound access to data.cms.gov.

This is the public facility-level file behind Hospital Compare. It carries ED
throughput measures (arrival-to-departure medians) and the left-without-being-
seen rate, which together are the patient-flow story.

    python fetch.py --out raw/timely_care.csv

The provider-data catalog exposes a stable CSV download per dataset. The UUID
below is 'Timely and Effective Care - Hospital'. If CMS rotates it, look it up
at https://data.cms.gov/provider-data/dataset/yv7e-xc69 and pass --url.
"""

import argparse
import shutil
import sys
import urllib.request

DEFAULT_URL = (
    "https://data.cms.gov/provider-data/sites/default/files/resources/"
    "yv7e-xc69/Timely_and_Effective_Care-Hospital.csv"
)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--out", default="raw/timely_care.csv")
    args = ap.parse_args()

    print(f"Downloading {args.url}", file=sys.stderr)
    req = urllib.request.Request(args.url, headers={"User-Agent": "portfolio-etl/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=180) as resp, \
             open(args.out, "wb") as fh:
            shutil.copyfileobj(resp, fh)
    except Exception as exc:                       # noqa: BLE001 — surface the real cause
        sys.exit(f"Download failed: {exc}\n"
                 f"Check the dataset page for a current URL, then pass --url.")

    print(f"Wrote {args.out}")
    print("Next: python clean.py")


if __name__ == "__main__":
    main()
