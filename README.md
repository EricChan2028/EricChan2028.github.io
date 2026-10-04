# ericchan2028.github.io

Personal academic homepage of **Changyuan Chen** (Eastern Michigan University), with a purple / gold / white design. It is plain HTML, CSS and JavaScript, with no build step and no dependencies. GitHub Pages serves it as is.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The page: hero, research, news, publications, experience, honors, contact. |
| `assets/js/papers.js` | **All publication content.** Edit this file to add a paper or attach a PDF. |
| `assets/js/main.js` | Paper cards, the detail sheet, filters, dark mode, the mobile menu and the hero animation. |
| `assets/css/style.css` | Styles. The colours are CSS variables at the top of the file. |
| `assets/cv/Changyuan_Chen_CV.pdf` | The CV linked from the header and the hero. |
| `assets/papers/` | Public PDFs and posters. |
| `404.html` | The "page not found" page. |

## Common edits

**Make a paper's PDF public** (for example, after the review period ends):

1. Put the file in `assets/papers/`, for example `assets/papers/prosper.pdf`.
2. In `assets/js/papers.js`, set that paper's `pdf: "assets/papers/prosper.pdf"`. An arXiv link also works, for example `pdf: "https://arxiv.org/pdf/XXXX.XXXXX"`.
3. When the review ends, replace the single-author list with the full author list (`authors: [...]`) and add a `bibtex` entry.

Each paper card then shows a **PDF** button. The detail sheet embeds the PDF in its **PDF** tab.

**Add a news item:** add an `<li>` to the `#news` list in `index.html`.

**Update the CV:** replace `assets/cv/Changyuan_Chen_CV.pdf`, keeping the same file name.

## Deep links

Every paper has a shareable URL:

- `#paper=gcd` opens the GCD detail sheet.
- `#paper=gcd&tab=results` opens a specific tab: `overview`, `results`, `cite` or `pdf`.

Paper ids: `gcd`, `prosper`, `selfplay`, `qd-mas`, `deltaadmet`, `clipstore`.

## Local preview

Open `index.html` directly in a browser. Alternatively, run `python -m http.server` in this folder and visit http://localhost:8000.
