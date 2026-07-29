# tools/

## `make_twb.py` — pre-built Tableau workbooks

A `.twb` is plain XML, so the setup half of each build can be generated: the
CSVs wired up, the joins declared, and **every calculated field from
`../specs/` already defined** — including the ones that are easy to get subtly
wrong (aggregate-level margin %, the aging-bucket sort order, the cost-of-float
parameter).

Run it on the machine where Tableau Desktop is installed:

```bash
python make_twb.py
# or point at the data explicitly:
python make_twb.py --data-root "C:/Users/Mike/Projects/spreadsheet-archaeology/portfolio/data"
```

Then open the `.twb`, confirm the data source connects, and build the sheets
following `../specs/`.

### What it does and doesn't generate

| Generated | Not generated |
|---|---|
| CSV connections, one per table | Worksheets |
| LEFT joins between fact and dimensions | Dashboards |
| All calculated fields, with formulas | Formatting and colour |
| The `Interest Rate` parameter (piece 02) | Reference lines |

Worksheet XML is deliberately left out. Hand-written sheet markup is fragile and
Tableau rejects it in ways that are tedious to debug — you'd spend longer fixing
a generated sheet than dragging the pills yourself. The setup and the calc-editor
typing are the parts worth automating.

### Notes

- Tableau writes **absolute paths** into a `.twb`. Regenerate rather than moving
  a generated file between machines. `workbooks/` is gitignored for this reason.
- Run each piece's `clean.py` first — the generator skips a piece whose
  `clean/*.csv` files are missing, and says so.
- Piece 03 connects `facility_flow.csv` only. `dim_benchmark.csv` is keyed on
  state + measure_id, which has no counterpart in the pivoted wide table; add
  `fact_measures.csv` as a second data source for the benchmark sheet.
- Formulas here are copied from `../specs/`. If you change one, change both.
