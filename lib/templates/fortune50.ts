export const FORTUNE_50_TEMPLATES: Record<string, { name: string; description: string; latex: string }> = {
  modern_dual_column: {
    name: "Modern Dual-Column Legal",
    description: "A clean, modern sans-serif layout with dual side-by-side signature blocks. Includes a striking cover page and header.",
    latex: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[top=0.5in, bottom=1in, left=1in, right=1in, includehead, headheight=45pt, headsep=10pt]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{sectsty}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\textcolor{BrandSecondary}{[DISPLAY_ID]}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\noindent
[COMPANY_HEADER] \\\\
\\vspace{2cm}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{3pt}} \\\\
\\vspace{0.5cm}
\\begin{flushleft}
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[TITLE]}}} \\\\
\\vspace{1cm}
{\\LARGE\\textbf{\\textcolor{BrandSecondary}{[COMPANY_NAME]}}} \\\\
\\vspace{2cm}
[COVER_IMAGE_BLOCK]
\\end{flushleft}
\\vfill
\\noindent\\textcolor{BrandSecondary}{\\small REF: [DISPLAY_ID] \\hfill \\today}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  strict_legal_watermark: {
    name: "Strict Legal (Watermark)",
    description: "A highly structured layout with Times New Roman and tight margins, designed for institutional agreements and strict compliance.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[top=0.5in, bottom=0.75in, left=0.75in, right=0.75in, includehead, headheight=45pt, headsep=10pt]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{draftwatermark}

\\SetWatermarkText{\\textbf{CONFIDENTIAL}}
\\SetWatermarkScale{0.5}
\\SetWatermarkColor[gray]{0.95}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{[DISPLAY_ID]}
\\fancyfoot[C]{\\thepage}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
[COMPANY_HEADER] \\\\
\\vspace{3cm}
{\\LARGE\\textbf{[TITLE]}} \\\\
\\vspace{1cm}
{\\large\\textbf{[COMPANY_NAME]}} \\\\
\\vspace{2cm}
[COVER_IMAGE_BLOCK]
\\vfill
CONFIDENTIAL AND PROPRIETARY \\\\
REF: [DISPLAY_ID] \\\\
\\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]
\\end{document}`
  },
  corporate_governance: {
    name: "Corporate Governance Record",
    description: "A formal layout with classic serif styling and a distinguished cover, ideal for board resolutions and shareholder consents.",
    latex: `\\documentclass[12pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{mathptmx}
\\usepackage{xcolor}
\\usepackage{graphicx}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
[COMPANY_HEADER] \\\\[3em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[COMPANY_NAME]}}} \\\\[2em]
\\noindent\\textcolor{BrandPrimary}{\\rule{0.5\\textwidth}{1pt}} \\\\[2em]
{\\LARGE\\textbf{[TITLE]}} \\\\[2em]
[COVER_IMAGE_BLOCK]
\\vfill
\\small\\textbf{CORPORATE RECORD REF: [DISPLAY_ID]} \\\\
\\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]
\\end{document}`
  },
  internal_memo: {
    name: "Strategic Internal Memo",
    description: "A clean internal corporate memo layout featuring a strong TO/FROM header block and integrated company logo.",
    latex: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{sectsty}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\begin{document}
\\noindent
\\begin{minipage}{0.5\\textwidth}
\\textbf{\\Huge \\textcolor{BrandPrimary}{MEMORANDUM}}
\\end{minipage}%
\\begin{minipage}{0.5\\textwidth}
\\begin{flushright}
[COMPANY_HEADER]
\\end{flushright}
\\end{minipage}

\\vspace{2em}
\\noindent
[MEMO_HEADERS]
\\vspace{1em}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\linewidth}{1.5pt}} \\\\[1.5em]

\\begin{center}
\\Large\\textbf{[TITLE]}
\\end{center}
\\vspace{1em}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]
\\end{document}`
  },
  mutual_nda: {
    name: "Mutual Non-Disclosure Agreement",
    description: "A rigorous two-column layout optimized for dense confidentiality agreements and terms of service.",
    latex: `\\documentclass[9pt,letterpaper]{article}
\\usepackage[top=0.5in, bottom=0.75in, left=0.6in, right=0.6in, includehead, headheight=35pt, headsep=8pt]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{multicol}
\\usepackage{enumitem}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\small\\textbf{MUTUAL NON-DISCLOSURE AGREEMENT}}
\\fancyhead[R]{\\small [DISPLAY_ID]}
\\fancyfoot[C]{\\small Page \\thepage}
\\fancyfoot[R]{\\small\\textcolor{BrandSecondary}{CONFIDENTIAL}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.3pt}

\\setlist[enumerate]{nosep, leftmargin=1.5em, label=\\textbf{\\arabic*.}}
\\setlength{\\columnsep}{1.5em}
\\setlength{\\columnseprule}{0.2pt}

\\begin{document}

\\begin{center}
\\noindent
\\begin{minipage}{0.3\\textwidth}
[COMPANY_HEADER]
\\end{minipage}%
\\hfill
\\begin{minipage}{0.65\\textwidth}
\\begin{flushright}
{\\LARGE\\textbf{\\textcolor{BrandPrimary}{MUTUAL NON-DISCLOSURE}}} \\\\[0.3em]
{\\LARGE\\textbf{\\textcolor{BrandPrimary}{AGREEMENT}}} \\\\[0.5em]
{\\large [COMPANY_NAME]} \\\\[0.3em]
{\\small REF: [DISPLAY_ID] \\quad|\\quad Effective Date: \\today}
\\end{flushright}
\\end{minipage}
\\end{center}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{2pt}}
\\vspace{0.8em}

\\begin{multicols}{2}
[SECTIONS_CONTENT]
\\end{multicols}

\\vspace{2em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{2em}

\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  term_sheet_financial: {
    name: "Term Sheet / Letter of Intent",
    description: "A clean, wide layout optimized for term sheets, LOIs, and cap table summaries with strong financial data presentation.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[top=0.5in, bottom=0.75in, left=0.75in, right=0.75in, includehead, headheight=45pt, headsep=10pt]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{booktabs}
\\usepackage{sectsty}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\textcolor{BrandSecondary}{\\small TERM SHEET --- [DISPLAY_ID]}}
\\fancyfoot[L]{\\small\\textcolor{gray}{NON-BINDING UNLESS OTHERWISE STATED}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.2pt}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\noindent
[COMPANY_HEADER] \\\\
\\vspace{1.5cm}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{3pt}} \\\\
\\vspace{0.3cm}
\\begin{flushleft}
{\\Huge\\textbf{\\textcolor{BrandPrimary}{TERM SHEET}}} \\\\[0.8em]
{\\LARGE\\textbf{[TITLE]}} \\\\[1em]
{\\large\\textcolor{BrandSecondary}{[COMPANY_NAME]}} \\\\
\\vspace{1.5cm}
[COVER_IMAGE_BLOCK]
\\end{flushleft}
\\vfill
\\noindent
\\begin{tabularx}{\\textwidth}{@{}Xr@{}}
\\textcolor{BrandSecondary}{\\small This document is for discussion purposes only.} & \\small REF: [DISPLAY_ID] \\\\
\\textcolor{BrandSecondary}{\\small It does not constitute a binding offer unless otherwise stated.} & \\small \\today \\\\
\\end{tabularx}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  employment_offer: {
    name: "Executive Offer Letter",
    description: "A warm, highly branded offer letter layout with a prominent cover photo and single-column signature block for digital signing.",
    latex: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{sectsty}
\\usepackage{parskip}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\noindent
[COMPANY_HEADER] \\\\
\\vspace{1cm}
[COVER_IMAGE_BLOCK]
\\vspace{1cm}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{2pt}} \\\\
\\vspace{0.5cm}
\\begin{flushleft}
{\\Huge\\textbf{\\textcolor{BrandPrimary}{OFFER OF EMPLOYMENT}}} \\\\[1em]
{\\LARGE\\textbf{[TITLE]}} \\\\[0.8em]
{\\large\\textcolor{BrandSecondary}{[COMPANY_NAME]}} \\\\[0.5em]
{\\small Prepared: \\today \\quad|\\quad REF: [DISPLAY_ID]}
\\end{flushleft}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{2em}

\\noindent
{\\small\\textbf{ACCEPTANCE OF OFFER}}

\\vspace{1em}
\\noindent
By signing below, I acknowledge that I have read and accept the terms and conditions set forth in this offer letter.

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  founder_equity_grid: {
    name: "Restricted Stock / Equity Agreement",
    description: "A heavy, traditional legal layout for RSPAs, option grants, and equity distribution with multi-party signature grids.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{enumitem}
\\usepackage{longtable}
\\usepackage{booktabs}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\small\\textbf{[COMPANY_NAME] --- EQUITY AGREEMENT}}
\\fancyhead[R]{\\small [DISPLAY_ID]}
\\fancyfoot[C]{\\small Page \\thepage}
\\fancyfoot[R]{\\small CONFIDENTIAL}
\\renewcommand{\\headrulewidth}{0.5pt}

\\setlist[enumerate]{leftmargin=2em}
\\setlist[enumerate,2]{label=(\\alph*), leftmargin=2.5em}
\\setlist[enumerate,3]{label=(\\roman*), leftmargin=3em}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
\\vspace*{2cm}
[COMPANY_HEADER] \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[COMPANY_NAME]}}} \\\\[1.5em]
\\textcolor{BrandPrimary}{\\rule{0.6\\textwidth}{2pt}} \\\\[1.5em]
{\\LARGE\\textbf{[TITLE]}} \\\\[1em]
{\\large RESTRICTED STOCK PURCHASE AGREEMENT} \\\\[2cm]
[COVER_IMAGE_BLOCK]
\\vfill
\\small
This agreement and the shares issued pursuant hereto have not been registered \\\\
under the Securities Act of 1933, as amended, and may not be sold, pledged, \\\\
or otherwise transferred without an effective registration thereof. \\\\[1em]
REF: [DISPLAY_ID] \\quad|\\quad \\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1.5pt}}
\\vspace{1em}

\\noindent
{\\small\\textbf{SIGNATURE PAGE TO [COMPANY_NAME] RESTRICTED STOCK PURCHASE AGREEMENT}}

\\vspace{2em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  safe_agreement: {
    name: "SAFE (Simple Agreement for Future Equity)",
    description: "A modern, single-column layout mirroring the Y-Combinator SAFE structure with dynamic branding and bolded defined terms.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{sectsty}
\\usepackage{enumitem}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\small\\textcolor{BrandSecondary}{SAFE --- [DISPLAY_ID]}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.3pt}

\\setlist[enumerate]{leftmargin=2em, label=\\textbf{\\arabic*.}}
\\setlist[enumerate,2]{label=(\\alph*), leftmargin=2.5em}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
\\vspace*{1.5cm}
[COMPANY_HEADER] \\\\[2em]
\\textcolor{BrandPrimary}{\\rule{0.4\\textwidth}{1pt}} \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{SAFE}}} \\\\[0.5em]
{\\Large\\textbf{Simple Agreement for Future Equity}} \\\\[2em]
{\\LARGE\\textbf{[COMPANY_NAME]}} \\\\[1em]
{\\large [TITLE]} \\\\[2cm]
[COVER_IMAGE_BLOCK]
\\vfill
\\small
THIS INSTRUMENT AND THE SECURITIES ISSUABLE UPON THE CONVERSION \\\\
HEREOF HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, \\\\
AS AMENDED. THEY MAY NOT BE SOLD, OFFERED FOR SALE, PLEDGED, OR \\\\
OTHERWISE TRANSFERRED EXCEPT IN COMPLIANCE THEREWITH. \\\\[1em]
REF: [DISPLAY_ID] \\quad|\\quad \\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{1em}

\\noindent
{\\small\\textbf{IN WITNESS WHEREOF}, the undersigned have caused this instrument to be duly executed and delivered.}

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  ip_assignment: {
    name: "Intellectual Property Assignment",
    description: "A formal IP assignment agreement for transferring patents, copyrights, and trade secrets to the company.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{enumitem}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\small\\textbf{IP ASSIGNMENT AGREEMENT}}
\\fancyhead[R]{\\small [DISPLAY_ID]}
\\fancyfoot[C]{\\small Page \\thepage}
\\renewcommand{\\headrulewidth}{0.5pt}

\\setlist[enumerate]{leftmargin=2em}
\\setlist[enumerate,2]{label=(\\alph*), leftmargin=2.5em}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
\\vspace*{2cm}
[COMPANY_HEADER] \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{INTELLECTUAL PROPERTY}}} \\\\[0.3em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{ASSIGNMENT AGREEMENT}}} \\\\[2em]
\\textcolor{BrandPrimary}{\\rule{0.5\\textwidth}{1.5pt}} \\\\[2em]
{\\LARGE\\textbf{[TITLE]}} \\\\[1em]
{\\large [COMPANY_NAME]} \\\\[2cm]
[COVER_IMAGE_BLOCK]
\\vfill
\\small CONFIDENTIAL \\\\
REF: [DISPLAY_ID] \\quad|\\quad \\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{2em}

\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  operating_agreement: {
    name: "LLC Operating Agreement",
    description: "A comprehensive operating agreement for LLCs, covering member roles, capital contributions, and governance provisions.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{enumitem}
\\usepackage{longtable}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\small\\textbf{[COMPANY_NAME] --- OPERATING AGREEMENT}}
\\fancyhead[R]{\\small [DISPLAY_ID]}
\\fancyfoot[C]{\\small Page \\thepage}
\\fancyfoot[R]{\\small CONFIDENTIAL}
\\renewcommand{\\headrulewidth}{0.5pt}

\\setlist[enumerate]{leftmargin=2em, label=\\textbf{\\arabic*.}}
\\setlist[enumerate,2]{label=(\\alph*), leftmargin=2.5em}
\\setlist[enumerate,3]{label=(\\roman*), leftmargin=3em}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
\\vspace*{1.5cm}
[COMPANY_HEADER] \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{OPERATING AGREEMENT}}} \\\\[1em]
{\\Large\\textbf{of}} \\\\[1em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[COMPANY_NAME]}}} \\\\[1em]
{\\large A Limited Liability Company} \\\\[2em]
\\textcolor{BrandPrimary}{\\rule{0.6\\textwidth}{2pt}} \\\\[2em]
{\\LARGE\\textbf{[TITLE]}} \\\\[2cm]
[COVER_IMAGE_BLOCK]
\\vfill
\\small
This Operating Agreement is entered into as of \\today \\\\
by and among the Members identified herein. \\\\[1em]
REF: [DISPLAY_ID]
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1.5pt}}
\\vspace{1em}

\\noindent
{\\small\\textbf{IN WITNESS WHEREOF}, the Members have executed this Operating Agreement as of the date first written above.}

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  consulting_agreement: {
    name: "Independent Contractor / Consulting",
    description: "A clean consulting or independent contractor agreement with clear scope, payment terms, and IP ownership provisions.",
    latex: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[top=0.5in, bottom=1in, left=1in, right=1in, includehead, headheight=45pt, headsep=10pt]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{sectsty}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\textcolor{BrandSecondary}{\\small [DISPLAY_ID]}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\noindent
[COMPANY_HEADER] \\\\
\\vspace{2cm}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{3pt}} \\\\
\\vspace{0.5cm}
\\begin{flushleft}
{\\Huge\\textbf{\\textcolor{BrandPrimary}{CONSULTING AGREEMENT}}} \\\\[1em]
{\\LARGE\\textbf{[TITLE]}} \\\\[1em]
{\\large\\textcolor{BrandSecondary}{[COMPANY_NAME]}} \\\\
\\vspace{2cm}
[COVER_IMAGE_BLOCK]
\\end{flushleft}
\\vfill
\\noindent\\textcolor{BrandSecondary}{\\small REF: [DISPLAY_ID] \\hfill \\today}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{4em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  board_resolution: {
    name: "Board Resolution / Unanimous Consent",
    description: "A formal board or shareholder resolution layout with action-item numbering and corporate seal placement.",
    latex: `\\documentclass[12pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{mathptmx}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{enumitem}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}

\\setlist[enumerate]{leftmargin=2.5em, label=\\textbf{RESOLVED \\arabic*.}}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
[COMPANY_HEADER] \\\\[3em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[COMPANY_NAME]}}} \\\\[1em]
{\\large A Delaware Corporation} \\\\[2em]
\\textcolor{BrandPrimary}{\\rule{0.5\\textwidth}{1pt}} \\\\[2em]
{\\LARGE\\textbf{[TITLE]}} \\\\[1em]
{\\large UNANIMOUS WRITTEN CONSENT} \\\\[0.5em]
{\\large OF THE BOARD OF DIRECTORS} \\\\[2em]
[COVER_IMAGE_BLOCK]
\\vfill
\\small
IN LIEU OF A SPECIAL MEETING \\\\
REF: [DISPLAY_ID] \\quad|\\quad \\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

\\noindent
The undersigned, being all of the members of the Board of Directors of \\textbf{[COMPANY_NAME]} (the \`\`Company''), a corporation organized and existing under the laws of the State of Delaware, hereby adopt the following resolutions by unanimous written consent in lieu of a special meeting of the Board of Directors:

\\vspace{2em}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{1em}

\\noindent
{\\small This Unanimous Written Consent may be executed in counterparts, each of which shall be deemed an original.}

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  convertible_note: {
    name: "Convertible Promissory Note",
    description: "A structured convertible note instrument with financial terms, maturity provisions, and conversion mechanics.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{sectsty}
\\usepackage{enumitem}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\small\\textcolor{BrandSecondary}{NOTE --- [DISPLAY_ID]}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.3pt}

\\setlist[enumerate]{leftmargin=2em, label=\\textbf{\\arabic*.}}
\\setlist[enumerate,2]{label=(\\alph*), leftmargin=2.5em}

\\begin{document}

\\begin{titlepage}
\\thispagestyle{empty}
\\begin{center}
\\vspace*{1.5cm}
[COMPANY_HEADER] \\\\[2em]
\\textcolor{BrandPrimary}{\\rule{0.4\\textwidth}{1pt}} \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{CONVERTIBLE}}} \\\\[0.3em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{PROMISSORY NOTE}}} \\\\[2em]
{\\LARGE\\textbf{[COMPANY_NAME]}} \\\\[1em]
{\\large [TITLE]} \\\\[2cm]
[COVER_IMAGE_BLOCK]
\\vfill
\\small
THIS NOTE AND THE SECURITIES ISSUABLE UPON CONVERSION HEREOF HAVE \\\\
NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED. \\\\[1em]
REF: [DISPLAY_ID] \\quad|\\quad \\today
\\end{center}
\\end{titlepage}

\\newpage
\\setcounter{page}{1}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{1em}

\\noindent
{\\small\\textbf{IN WITNESS WHEREOF}, the Company has caused this Convertible Promissory Note to be duly executed as of the date first written above.}

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  },
  privacy_policy: {
    name: "Privacy Policy / Terms of Service",
    description: "A modern, readable privacy policy or terms of service layout with clear section numbering and consumer-friendly formatting.",
    latex: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{sectsty}
\\usepackage{enumitem}
\\usepackage{parskip}

\\definecolor{BrandPrimary}{HTML}{[BRAND_PRIMARY]}
\\definecolor{BrandSecondary}{HTML}{[BRAND_SECONDARY]}
\\sectionfont{\\color{BrandPrimary}}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{[COMPANY_HEADER]}
\\fancyhead[R]{\\small\\textcolor{BrandSecondary}{Last Updated: \\today}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.3pt}

\\setlist[enumerate]{leftmargin=2em, label=\\textbf{\\arabic*.}}

\\begin{document}

\\begin{center}
[COMPANY_HEADER] \\\\[2em]
{\\Huge\\textbf{\\textcolor{BrandPrimary}{[TITLE]}}} \\\\[1em]
{\\large [COMPANY_NAME]} \\\\[0.5em]
{\\small Effective Date: \\today \\quad|\\quad REF: [DISPLAY_ID]}
\\end{center}

\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1.5pt}}
\\vspace{1em}

[SECTIONS_CONTENT]

\\vspace{3em}
\\noindent\\textcolor{BrandPrimary}{\\rule{\\textwidth}{1pt}}
\\vspace{1em}

\\noindent
{\\small If you have any questions about this policy, please contact us at the address provided on our website.}

\\vspace{3em}
\\noindent
[SIGNATURES_CONTENT]

\\end{document}`
  }
};
