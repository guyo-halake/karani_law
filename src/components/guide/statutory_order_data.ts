/**
 * Republic of Kenya — Laws of Kenya
 * The Advocates (Remuneration) Order (Legal Notice 64 of 1962)
 * Consolidated with all Legal Notices up to L.N. 221 of 2023 (24th Annual Supplement).
 * Sourced directly from National Council for Law Reporting (Kenya Law).
 * 
 * Contains all 79 sections (including amendments) and Schedules 1 through 12,
 * linked to the Karani Law Fee Engine.
 */

export interface StatutorySection {
  number: string;
  title: string;
  part: 'part_I' | 'part_II' | 'part_III';
  partTitle: string;
  content: string;
  notes?: string;
  engineRule?: {
    rule: string;
    description: string;
    formula?: string;
  } | null;
}

export interface StatutoryScale {
  name: string;
  type: string;
  rules: string[];
  notes?: string;
}

export interface StatutoryScheduleDetail {
  scheduleNumber: number;
  title: string;
  shortTitle: string;
  legalRef: string;
  category: string;
  scales: StatutoryScale[];
}

export const STATUTORY_METADATA = {
  title: "The Advocates (Remuneration) Order",
  legalNotice: "Legal Notice 64 of 1962",
  gazette: "Published in Kenya Gazette Vol. LXIV—No. 5 on 30 January 1962",
  commencement: "Commenced on 30 January 1962",
  latestRevision: "Revised by 24th Annual Supplement (Legal Notice 221 of 2023) on 31 December 2022",
  primaryWork: "Advocates Act (Cap. 16)",
  citationsCount: "2 / 748",
  relatedDocuments: [
    { title: "Advocates Act (Cap. 16)", type: "Primary Act", ref: "Cap. 16" },
    { title: "Civil Procedure Act (Cap. 21) & Civil Procedure Rules", type: "Subsidiary Legislation", ref: "Cap. 21" },
    { title: "Landlord and Tenant (Shops, Hotels & Catering) Act", type: "Tribunal Jurisdiction", ref: "Cap. 301" },
    { title: "Rent Restriction Act", type: "Tribunal Jurisdiction", ref: "Cap. 296" }
  ],
  amendmentHistory: [
    "Remuneration of Advocates (Amendment) Order, 1964 (Legal Notice 8 of 1965) on 1 January 1965",
    "Advocates (Remuneration) (Amendment) Order, 1967 (Legal Notice 227 of 1967) on 3 November 1967",
    "Advocates (Remuneration) (Amendment) Order, 1969 (Legal Notice 198 of 1969) on 5 September 1969",
    "Advocates (Remuneration) (Amendment) Order, 1972 (Legal Notice 56 of 1972) on 1 April 1972",
    "Advocates (Remuneration) (Amendment) Order, 1973 (Legal Notice 164 of 1973) on 24 August 1973",
    "Advocates (Remuneration) (Amendment) Order, 1977 (Legal Notice 37 of 1977) on 1 March 1977",
    "Advocates (Remuneration) (Amendment) Order, 1978 (Legal Notice 264 of 1978) on 1 January 1979",
    "Advocates (Remuneration) (Amendment) Order, 1978 Corrigenda (Corrigendum 3 of 1979) on 26 January 1979",
    "Advocates (Remuneration) (Amendment) Order, 1979 (Legal Notice 62 of 1979) on 12 April 1979",
    "Laws of Kenya (Rectification) Order, 1980 (Legal Notice 117 of 1980) on 8 August 1980",
    "Advocates (Remuneration) (Amendment) Order, 1982 (Legal Notice 70 of 1982) on 28 May 1982",
    "Advocates (Remuneration) (Amendment) Order, 1983 (Legal Notice 73 of 1983) on 1 May 1983",
    "Advocates (Remuneration) (Amendment) Order, 1984 (Legal Notice 121 of 1984) on 3 August 1984",
    "Advocates (Remuneration) (Amendment) Order, 1993 (Legal Notice 264 of 1993) on 3 September 1993",
    "Advocates (Remuneration) (Amendment) Order, 1997 (Legal Notice 550 of 1997) on 2 December 1997",
    "Advocates (Remuneration) (Amendment) Order, 2006 (Legal Notice 159 of 2006) on 24 November 2006",
    "Advocates (Remuneration) (Amendment) Order, 2009 (Legal Notice 50 of 2009) on 9 April 2009",
    "Advocates (Remuneration) (Amendment) Order, 2014 (Legal Notice 35 of 2014) on 11 April 2014",
    "Advocates (Remuneration) (Amendment) (No. 2) Order, 2014 (Legal Notice 45 of 2014) on 16 May 2014",
    "Advocates (Remuneration) (Amendment) Order, 2017 (Legal Notice 268 of 2017) on 17 November 2017",
    "Revised by 24th Annual Supplement (Legal Notice 221 of 2023) on 31 December 2022"
  ]
};

export const STATUTORY_PARTS = [
  {
    id: "part_I",
    title: "Part I – GENERAL MATTERS",
    sectionsRange: "Sections 1 to 17",
    description: "Foundational rules governing application, minimum scale fees, exceptional dispatch, complexity, 14% p.a. interest, taxing officers, and folio definition."
  },
  {
    id: "part_II",
    title: "Part II – NON-CONTENTIOUS MATTERS",
    sectionsRange: "Sections 18 to 48",
    description: "Conveyancing, land sales, mortgages, debentures, leases, companies, trademarks, patents, probate administration, and Schedule 5 elections."
  },
  {
    id: "part_III",
    title: "Part III – TAXATION OF COSTS IN CONTENTIOUS AND OTHER MATTERS",
    sectionsRange: "Sections 49 to 79",
    description: "High Court and Subordinate Court taxation, 5-column bills of costs, Party & Party vs Advocate & Client (+50%), and the 1/6th taxed-off rule."
  }
];

export const STATUTORY_SECTIONS: StatutorySection[] = [
  {
    "number": "1",
    "title": "Citation",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "This Order may be cited as the Advocates (Remuneration) Order."
  },
  {
    "number": "2",
    "title": "Application of Order",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 56/1972, s. 2, L.N. 62/1979, s. 3.]",
    "engineRule": null,
    "content": "This Order shall apply to the remuneration of an advocate of the High Court by his client in contentious and non-contentious matters, the taxation thereof and the taxation of costs as between party and party in contentious matters in the High Court, in subordinate courts (other than Muslim courts), in a Tribunal appointed under the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301) and in a Tribunal established under the Rent Restriction Act (Cap. 296)."
  },
  {
    "number": "3",
    "title": "Scale of fees",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 37/1977, s. 2, L.N. 62/1979, s. 4, L.N. 159/2006, s. 2.]",
    "engineRule": {
      "rule": "Scale of Fees Minimum Floor",
      "description": "No advocate may agree or accept remuneration at less than that provided by this Order. Sets the mandatory minimum fee floor.",
      "formula": "Fee >= Prescribed Scale Minimum"
    },
    "content": "No advocate may agree or accept his remuneration at less than that provided by this Order."
  },
  {
    "number": "4",
    "title": "Additional remuneration for exceptional dispatch",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 62/1979, s. 5.]",
    "engineRule": null,
    "content": "(1)\n\nWhere any business requires and receives exceptional dispatch, or, at the request of the client, is attended to outside normal business hours the advocate shall be entitled to receive and shall be allowed such additional remuneration as is appropriate in the circumstances.\n\n(2)\n\nSuch additional remuneration shall, except in special circumstances, be allowable only as between advocate and client."
  },
  {
    "number": "5",
    "title": "Special fee for exceptional importance and complexity",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "(1)\n\nIn business of exceptional importance or of unusual complexity an advocate shall be entitled to receive and shall be allowed as against his client a special fee in addition to the remuneration provided in this Order.\n\n(2)\n\nIn assessing such special fee regard may be had to\u2014\n\n(a)\n\nthe place at or the circumstances in which the business or part thereof is transacted;\n\n(b)\n\nthe nature and extent of the pecuniary or other interest involved;\n\n(c)\n\nthe labour and responsibility entailed; and\n\n(d)\n\nthe number, complexity and importance of the documents prepared or examined."
  },
  {
    "number": "6",
    "title": "Security from client for advocate\u2019s remuneration",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "An advocate may accept from his client and a client may give to his advocate security for the amount to become due to the advocate for remuneration and disbursements in business to be transacted or being transacted by him and for interest as hereinafter provided on such amount, but so that interest is not to commence until the amount due is ascertained either by agreement or taxation:\n\nProvided that, for the purpose of this rule, the amount of such costs and disbursements shall be deemed to have been agreed as at the expiry of one calendar month from the date of delivery of the bill unless the client shall within such period have disputed the same or applied to have the same taxed."
  },
  {
    "number": "7",
    "title": "Interest may be charged",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 37/1977, s. 3, L.N. 117/1980, Sch., L.N. 159/2006, s. 3.]",
    "engineRule": {
      "rule": "14% p.a. Statutory Interest",
      "description": "Interest chargeable at 14% per annum on disbursements and costs from 1 month after delivery of bill.",
      "formula": "Interest = Principal * 0.14 * (Days / 365)"
    },
    "content": "An advocate may charge interest at 14 per cent per annum on his disbursements and costs, whether by scale or otherwise, from the expiration of one month from the delivery of his bill to the client, provided that such claim for interest is raised before the amount of the bill shall have been paid or tendered in full."
  },
  {
    "number": "8",
    "title": "Costs payable by an executor, administrator or trustee",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "Where costs are payable to his advocate by an executor, administrator or trustee for or in connexion with work required to be done for him in that capacity such costs shall be so computed as to afford a complete indemnity against all expenses properly incurred in the matter and any taxation thereof shall be on the basis of advocate and own client."
  },
  {
    "number": "9",
    "title": "Costs payable by infant, etc",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "In cases where a bill of costs is payable by an infant or lunatic or out of a fund not presently available, demand for payment thereof may be made on the parent or guardian or trustee or other person liable."
  },
  {
    "number": "10",
    "title": "Taxing officer",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 56/1972, s. 3, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "The taxing officer for the taxation of bills under this Order shall be the Registrar or a district or deputy registrar of the High Court or, in the absence of a registrar, such other qualified officer as the Chief Justice may in writing appoint; except that in respect of bills under Schedule 4 to the order the taxing officer shall be the registrar of trade marks or any deputy or assistant registrar of trade marks."
  },
  {
    "number": "11",
    "title": "Objection to decision on taxation and appeal to Court of Appeal",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 8/1965, Sch.]",
    "engineRule": null,
    "content": "(1)\n\nShould any party object to the decision of the taxing officer, he may within fourteen days after the decision give notice in writing to the taxing officer of the items of taxation to which he objects.\n\n(2)\n\nThe taxing officer shall forthwith record and forward to the objector the reasons for his decision on those items and the objector may within fourteen days from the receipt of the reasons apply to a judge by chamber summons, which shall be served on all the parties concerned, setting out the grounds of his objection.\n\n(3)\n\nAny person aggrieved by the decision of the judge upon any objection referred to such judge under subsection (2) may, with the leave of the judge but not otherwise, appeal to the Court of Appeal.\n\n(4)\n\nThe High Court shall have power in its discretion by order to enlarge the time fixed by subparagraph (1) or subparagraph (2) far the taking of any step; application for such an order may be made by chamber summons upon giving to every other interested party not less than three clear days\u2019 notice in writing or as the Court may direct, and may be so made notwithstanding that the time sought to be enlarged may have already expired."
  },
  {
    "number": "12",
    "title": "Reference by consent",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "With the consent of both parties, the taxing officer may refer any matter in dispute arising out of the taxation of a bill for the opinion of the High Court. The procedure for such reference shall follow that of a case stated but shall be to a judge in chambers."
  },
  {
    "number": "13",
    "title": "Taxation of cost as between advocate and client on application of either party",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 73/1983, s. 3.]",
    "engineRule": null,
    "content": "(1)\n\nThe taxing officer may tax costs as between advocate and client without any order for the purpose upon the application of the advocate or upon the application of the client, but where a client applies for taxation of a bill which has been rendered in summarized or block form the taxing officer shall give the advocate an opportunity to submit an itemized bill of costs before proceeding with such taxation, and in such event the advocate shall not be bound by or limited to the amount of the bill rendered in summarized or block form.\n\n(2)\n\nDue notice of the date fixed for such taxation shall be given to both parties and both shall be entitled to attend and be heard.\n\n(3)\n\nThe bill of costs shall be filed in a miscellaneous cause in which notice of taxation may issue, but no advocate shall be entitled to an instruction fee in respect thereof."
  },
  {
    "number": "13A",
    "title": "Powers of taxing officer",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 227/1967, s. 2.]",
    "engineRule": null,
    "content": "For the purpose of any proceeding before him, the taxing officer shall have power and authority to summon and examine witnesses, to administer oaths, to direct the production of books, paper and documents and to direct and adopt all such other proceedings as may be necessary for the determination of any matter in dispute before him."
  },
  {
    "number": "14",
    "title": "Default of advocate to attend taxation after notice",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "Any advocate who after the due notice without reasonable excuse fail to appear on the date and at the time fixed for taxation or on any date and time to which such taxation is adjourned, or who shall in any way delay or impede the taxation, or put any other party to any unnecessary or improper expense relative to such taxation shall, on the order of the taxing officer, forfeit the fees to which he would otherwise be entitled for drawing his bill of costs and attending the taxation, and shall in addition be personally liable to pay for any unnecessary or improper expense to which he has put any party; and the taxing officer may proceed with such taxation ex parte."
  },
  {
    "number": "15",
    "title": "Taxation procedure contained in Part III to apply to bills under Part II",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "The provisions of Part III of this Order as to the form and procedure for filing and disposal of a bill of costs for taxation shall apply in all appropriate respects and so far as practicable to any bill of costs under Part II of this Order which may require to be taxed."
  },
  {
    "number": "16",
    "title": "Discretion of taxing officer",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "",
    "engineRule": null,
    "content": "Notwithstanding anything contained in this Order, on every taxation the taxing officer may allow all such costs, charges and expenses as authorized in this Order as shall appear to him to have been necessary or proper for the attainment of justice or for defending the rights of any party, but, save as against the party who incurred the same, no costs shall be allowed which appear to the taxing officer to have been incurred or increased through overcaution, negligence or mistake, or by payment of special charges or expenses to witnesses or other persons, or by other unusual expenses."
  },
  {
    "number": "17",
    "title": "Length of folio",
    "part": "part_I",
    "partTitle": "Part I \u2013 General Matters",
    "notes": "[L.N. 8/1965, Sch., L.N. 73/1983, s. 2.]",
    "engineRule": {
      "rule": "1 Folio = 100 Words",
      "description": "A folio consists of 100 words. Fractions of a folio count as 1 folio. Figures of one denomination (e.g. \u00a325,564) count as 3 words.",
      "formula": "Folios = Math.ceil(WordCount / 100)"
    },
    "content": "A folio shall for all purposes of this Order be deemed to consist of 100 words and any part of a folio shall be charged as one folio. A sum or quantity of one denomination stated in figures is to be counted as one word: eg. \"\u00a325,564 16s 8d.\" is to be counted as three words, and \"254 feet 11 inches\" is to be counted as four words."
  },
  {
    "number": "18",
    "title": "Remuneration of advocate in non-contentious matters",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 8/1965, Sch., L.N. 56/1972, r. 2, L.N. 73/1983, r. 4, L.N. 35/2014, r. 5.]",
    "engineRule": null,
    "content": "Subject to paragraph 22, the remuneration of an advocate in respect of conveyance and general business (not being in any action, or transacted in any court or in chambers of any judge or registrar) shall be regulated as follows\u2014\n\nSales, purchases and securities\n\n(a)\n\nin respect of sales and purchases of immovable property or an interest in immovable property, and in respect of debentures, mortgages and charges, and in respect of negotiating commissions on sales and mortgages, theremuneration is to be that prescribed in Schedule 1:\n\nProvided that where the advocate acting for a vendor does not prepare a letter of agreement, heads of agreement or agreement for sale, the scale fee is reduced by one-third.\n\nLeases and agreements for lease of land\n\n(b)\n\nIn respect of leases, agreements for lease or conveyances reserving rents or agreements for the same, the remuneration is to be that prescribed in Schedule 2.\n\nCompanies formations, incorporations and registrations\n\n(c)\n\nIn respect of business in connection with the formation, incorporation and registration of a company, the remuneration is to be that prescribed in Schedule 3.\n\nTrademarks\n\n(d)\n\nIn respect of business in connection with the registration of and proceedings concerning trademarks, the remuneration is to be that prescribed in Schedule 4.\n\nEstates\n\n(e)\n\nIn respect of business in connection with probate and the administration of estates, the remuneration is to be that prescribed in Schedule 10.\n\nUncompleted transactions and other business\n\n(f)\n\nIn respect of any business referred to in this paragraph which is not completed, and in respect of other deeds or documents, including settlements, deeds of gift inter vivos, assents and instruments vesting property in new trustees, and any other business of a non-contentious nature, the remuneration which has otherwise not been provided for, the remuneration is to be that prescribed in Schedule 5.\n\nPatents, designs and utility models\n\n(g)\n\nIn respect of business in connection with the registration of patents, designs and utility models as well as proceedings concerning patents, designs and utility models, the remuneration is to be that prescribed in Schedule 12."
  },
  {
    "number": "19",
    "title": "Expenses chargeable in addition to remuneration",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 37/1977, s. 4.]",
    "engineRule": null,
    "content": "The remuneration prescribed by this Order does not include stamps, auctioneer\u2019s or valuer\u2019s charges, agent\u2019s fees, travelling expenses, fees paid on searches in public offices or on registration, costs of extracts from any register, record or roll, cost of photocopies and other disbursements reasonably and properly incurred, but includes stationery, copies of letters and charges and allowances for time of the advocate and his clerks."
  },
  {
    "number": "20",
    "title": "Scale charges; what they include and exclude",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 62/1979, s. 6.]",
    "engineRule": null,
    "content": "(1)\n\nScale charges shall include all work ordinarily incidental to a transaction, and in the case of a conveyance, transfer or mortgage shall include\u2014\n\n(a)\n\ntaking of instructions to prepare the necessary deed or document;\n\n(b)\n\ninvestigation of title;\n\n(c)\n\nreport on the title to the client;\n\n(d)\n\npreparation or approval or adjustment of the deed or document;\n\n(e)\n\nsettlement of the transaction if in the town of the advocate\u2019s practice;\n\n(f)\n\nobtaining by correspondence any necessary consent or clearance certificate\n\nbut excluding land control consent;\n\n(g)\n\nregistration of the deed;\n\n(h)\n\ncorrespondence between advocate and client.\n\n(2)\n\nScale charges shall not include\u2014\n\n(a)\n\nprior negotiations leading up to or necessary in the completion of a bargain;\n\n(b)\n\ntracing of title deeds or obtaining certified copies thereof;\n\n(c)\n\npayment of withholding tax or obtaining of exemption therefrom;\n\n(d)\n\ncompletion of valuation forms for assessment of stamp duties;\n\n(e)\n\nadjudication of stamp duties;\n\n(f)\n\nobtaining land control consent and personal attendances for obtaining of any necessary consent or clearance certificate under subparagraph (1)(f);\n\n(g)\n\nextra work occasioned by special circumstances;\n\n(h)\n\nextra work occasioned by a change of circumstances emerging while an item of business is in progress, e.g. the death or bankruptcy of a party to the transaction."
  },
  {
    "number": "21",
    "title": "Scale fees: how calculated",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": {
      "rule": "Basis of Consideration for Scale Fees",
      "description": "Hierarchical determination of value: (a) stamp duty value; failing which (b) estate duty value; failing which (c) last sale price within 10 years; failing which (d) 3-year average market value.",
      "formula": "Value = StampDutyValue || EstateDutyValue || Last10YrPrice || Avg3YrMarketValue"
    },
    "content": "In the calculation of scale charges the basis of charge shall unless otherwise provided in the Schedules, and irrespective of the number of titles involved or documents required to be prepared or approved, be the sum set forth in the deed or document as the price or consideration or, if no price or consideration or only a nominal price or consideration is set forth, the value of the subject matter affected by the deed, which shall be deemed to be\u2014\n\n(a)\n\nthe value fixed for the purpose of stamp duty; which failing\n\n(b)\n\nthe sum at which the property affected has last been passed for estate duty; which failing\n\n(c)\n\nthe last price at which a sale has taken place within ten years from the date of the transaction; which failing\n\n(d)\n\nthe estimated average market value during the preceding three years."
  },
  {
    "number": "22",
    "title": "Liberty to advocate to elect Schedule 5; election to be communicated to client in writing",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 56/1972, s. 5, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "(1)\n\nIn all cases in which any other Schedule applies, an advocate may, before or contemporaneously with rendering a bill of costs drawn as between advocate and client, signify to the client his election that, instead of charging under such Schedule, his remuneration shall be according to Schedule 5, but if no election is made his remuneration shall be according to the scale applicable under the other Schedule.\n\n(2)\n\nSubject to paragraph 3, an advocate who makes an election under subparagraph (1) of this paragraph may not by reason of his election charge less than the scale fee under the appropriate Schedule."
  },
  {
    "number": "23",
    "title": "Items to be charged for separately under appropriate Schedule",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "In the event of the business handled by an advocate in the course of any one transaction falling under more than one of the categories prescribed by Schedules 1 to 4, each item shall be charged separately according to the remuneration prescribed by the Schedule within which it falls and any part of the business not specially provided for by any of the said Schedule 1 to 4 shall be charged under Schedule 5."
  },
  {
    "number": "23A",
    "title": "Choice of methods of completion of transaction; fee applicable",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 56/1972, s. 6.]",
    "engineRule": null,
    "content": "Where a transaction may be completed in more ways than one, the advocate concerned may complete the transaction in any way he chooses but, in the absence of agreement to the contrary, he must charge the fee applicable to the method attracting the lowest fee."
  },
  {
    "number": "24",
    "title": "Documents; by whom to be prepared",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "Unless otherwise agreed, all conveyancing documents shall be prepared by the advocate of the parties as follows\u2014\n\n(a) conveyance or transfer or assignment\n\nadvocate of the purchaser or party to whom property is conveyed, transferred or assigned;\n\n(b) mortgage or charge\n\nadvocate of mortgagee or chargee;\n\n(c) release or discharge\n\nadvocate of party in whose favour release or discharge is given;\n\n(d) Lease\n\nadvocate of lessor;\n\n(e) all other documents\n\nadvocate of the grantee or obligee, unless express provision to the contrary is made else where in this Order."
  },
  {
    "number": "25",
    "title": "Place of completion",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 56/1972, s. 8.]",
    "engineRule": null,
    "content": "Unless otherwise agreed, the place of completion of conveyancing transactions shall be the office of the advocate for the vendor, mortgagee, chargee or lessor as the case may be."
  },
  {
    "number": "26",
    "title": "Definitions and application of Schedule 1",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "(1)\n\nRules 27 to 41 shall govern the application of Schedule 1 and shall be applied in sequence, and the words \"the scales\", or words of similar import appearing in any of the said rules, shall be read and construed as meaning the charges prescribed by the First, Second and Third Scales to the said Schedule, as modified by the provisions of any preceding rule.\n\n(2)\n\nIn this Order, wherever their application so requires, \"conveyance\", \"mortgage\", \"mortgagor\", and \"mortgagee\" shall respectively be read and construed as \"transfer\" or \"assignment\", \"charge\", \"chargor\" and \"chargee\"."
  },
  {
    "number": "27",
    "title": "Commission for negotiating sale or purchase",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "Commission for negotiating a sale or purchase by private contract shall apply to cases where the advocate of a vendor or purchaser arranges the sale or purchase and the price and terms and conditions thereof, and no commission is paid by the client to an auctioneer, or estate or other agent."
  },
  {
    "number": "28",
    "title": "Remuneration for conveyance on a sale by auction",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "The remuneration for deducting title and perusing and completing conveyance on a sale by auction is to be chargeable on each lot of property except that where property held under the same title is divided into lots for convenience of sale and the same purchaser buys several lots and takes one conveyance and only one abstract of title is delivered the remuneration is to be chargeable upon the aggregate prices of the lots."
  },
  {
    "number": "29",
    "title": "Charges where same advocate acting for both vendor and purchaser",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": {
      "rule": "Dual Representation on Sale (-1/6th)",
      "description": "Where an advocate acts for both vendor and purchaser, vendor's charges and purchaser's charges are each reduced by 1/6th (16.67%).",
      "formula": "Fee_Vendor = ScaleFee * (5/6); Fee_Purchaser = ScaleFee * (5/6)"
    },
    "content": "Where an advocate acts for both vendor and purchaser he shall be entitled to charge as against the vendor the vendor\u2019s advocate\u2019s charges and as against the purchaser the purchaser\u2019s advocate\u2019s charges, such charges in each case to be reduced by one-sixth."
  },
  {
    "number": "30",
    "title": "Commission for negotiating loan",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "The commission for negotiating a loan shall be payable to the mortgagor\u2019s advocate where he arranges and obtains the loan on instructions from the mortgagor to endeavour to raise or find the loan. The commission for negotiating a loan shall be payable to the mortgagee\u2019s advocate where he arranges the loan on instructions from the mortgagee to arrange or find an investment. Where an advocate arranges a loan between two clients on respective instructions to raise a loan and to find an investment he shall be entitled to charge only the one commission, of which half shall be payable by the mortgagor and half by the mortgagee."
  },
  {
    "number": "31",
    "title": "Costs of mortgage to be paid by borrower",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 62/1979, s. 7.]",
    "engineRule": null,
    "content": "The costs of a mortgagee for the investigation of title and the preparation, completion and registration of his security or of any discharge or assignment thereof made at the request of the borrower, whether or not the transaction is completed, shall be payable to the borrower, but any commission due to the mortgagee\u2019s advocate for negotiating the loan shall be payable by the mortgagee."
  },
  {
    "number": "32",
    "title": "Building society mortgagee",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 56/1972, s. 9, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "(1)\n\nWhere an advocate acting on behalf of a building society mortgagee makes use of a printed or stereotyped form of engrossment of mortgage or discharge, the fee payable to the mortgagee\u2019s advocate in respect thereof under Schedule 1 shall be reduced by one-third but is not subject under this paragraph and any other paragraph to a reduction in excess of one-half of the scale fee.\n\n(2)\n\nFor the purposes of this rule, a building society shall be deemed to include any association, corporation or company acting in the making of an advance or the lending of money on the security of, or for the purposes of purchasing or building, domestic residential property."
  },
  {
    "number": "33",
    "title": "Charges where advocate is concerned for both mortgagor and mortgagee",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 62/1979, s. 8]",
    "engineRule": {
      "rule": "Advocate for Both Mortgagor & Mortgagee",
      "description": "Charge the mortgagee's advocate's full charges PLUS one-half (50%) of the mortgagor's advocate's charges.",
      "formula": "TotalFee = MortgageeScaleFee + (0.5 * MortgagorScaleFee)"
    },
    "content": "Where an advocate is concerned for both mortgagor and mortgagee, he shall charge the mortgagee\u2019s advocate\u2019s charges and one-half of those which would be allowed to the mortgagor\u2019s advocate."
  },
  {
    "number": "34",
    "title": "Charges where conveyance and mortgage are prepared by one advocate",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 62/1979, s. 9]",
    "engineRule": {
      "rule": "Conveyance & Mortgage Prepared by Same Advocate",
      "description": "Charge full scale fee on the conveyance PLUS one-half (50%) of the scale fee for the mortgage.",
      "formula": "TotalFee = ConveyanceScaleFee + (0.5 * MortgageScaleFee)"
    },
    "content": "Where a conveyance and mortgage of the same property are completed at the same time and are prepared by the same advocate he shall charge only one-half of the scale fees for preparing and approving the mortgage deed in addition to his charges for the conveyance and his commission for negotiating (if any)."
  },
  {
    "number": "35",
    "title": "Charges where one document prepared and one approved by one advocate",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 56/1972, s. 10, L.N. 62/1979, s. 10.]",
    "engineRule": {
      "rule": "Conveyance & Mortgage Completed Contemporaneously",
      "description": "Respective advocates charge full scale fee on conveyance PLUS one-half (50%) of scale fee for mortgage.",
      "formula": "ConveyanceFee + (0.5 * MortgageFee)"
    },
    "content": "Where a conveyance and a mortgage of the same property are completed at the same time, the respective advocates acting for the vendor and purchaser shall charge the appropriate scale fee on the conveyance and their commissions for negotiating (if any). For preparing and approving the mortgage, they shall charge one-half of the appropriate scale fee."
  },
  {
    "number": "36",
    "title": "Charges where mortgage in favour of vendor and one advocate acts for both parties",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 62/1979, s. 11.]",
    "engineRule": {
      "rule": "Vendor Mortgagee Dual Representation",
      "description": "Where mortgage is in favour of vendor and same advocate acts: charge full conveyance PLUS one-third (33.33%) of mortgage scale fee.",
      "formula": "TotalFee = ConveyanceScaleFee + (1/3 * MortgageScaleFee)"
    },
    "content": "Where a conveyance and mortgage of the same property are completed at the same time and are prepared by the same advocate, and the mortgagee is the vendor, the advocate shall be entitled to charge only one-third of the scale fee prescribed for preparing and approving the mortgage deed in addition to his charge for the conveyance and his commission for negotiating (if any)."
  },
  {
    "number": "37",
    "title": "Where property is sold subject to incumbrances",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "Where a property is sold subject to incumbrances consisting of one or more legal mortgages or legal charges, the amount of the incumbrances shall be deemed part of the purchase money for the purpose of calculating the charges for the conveyance, except where the mortgagee is the purchaser, in which case the charge for the conveyance shall be calculated upon the price of the equity of redemption."
  },
  {
    "number": "38",
    "title": "Charges for mortgage to advocate",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "Any advocate to whom, either alone or jointly with any other person, a mortgage of immovable property is granted as security for money shall be entitled to charge for all business transacted and acts done in investigating the title to the property and preparing and completing the mortgage, all such professional charges and remuneration, other than negotiating commission, as he would have been entitled to receive if such mortgage had been made to a person not an advocate, and such person had retained and employed such advocate to transact such business and do such acts; and such charges and remuneration shall accordingly be recoverable from the mortgagor.\n\n39. Charges for transfer of mortgage to advocate or subsequent work in relation to mortgage in which advocate is personally interested\n\nAny advocate to or in whom, either alone or jointly with any other person, any mortgage is transferred or is vested, shall be entitled to charge for all business transacted and acts done by such advocate in relation to such mortgage or to the security thereby created or the property therein comprised, all such professional charges and remuneration, other than negotiating commission, as he would have been entitled to receive if such mortgage had been transferred to and had remained vested in a person not an advocate, and to recover the same from the person on whose behalf such business is transacted and work done, or to charge the same against the security as if such person had retained and employed such advocate to transact such business and do such acts."
  },
  {
    "number": "40",
    "title": "Scale: how reckoned on transfers of mortgages",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "The scale fee as to mortgages shall apply to transfers of mortgages where the title is investigated, but not to transfers where the title was investigated by the same advocate on the original mortgage or on any previous transfer; and the said scale fee shall not apply to further charges where the title has been previously investigated by the same advocate or firm of advocates within the next preceding twelve months. As to such transfers and further charges the remuneration shall be regulated according to Schedule 5, but the commission (if any) for negotiating the loan shall be chargeable on such transfers and further charges under Schedule 1."
  },
  {
    "number": "41",
    "title": "Charges for approving draft on behalf of several parties having different interests",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 37/1977, s. 5.]",
    "engineRule": {
      "rule": "Draft Approval for Distinct Parties",
      "description": "Full scale fee for first party plus Kshs. 250 for each distinct party thereafter, shared equally.",
      "formula": "TotalFee = ScaleFee + (DistinctParties - 1) * 250"
    },
    "content": "If any advocate approves of a draft on behalf of several parties having distinct, but not conflicting, interests capable of separate representation, he shall be entitled to charge the scale fee in respect of the first or principal party, and Sh. 250 in addition for each such party after the first, the whole charges to be aggregated and paid in equal shares by such parties or apportioned according to their respective interests."
  },
  {
    "number": "42",
    "title": "Application of Schedule 2",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Rules 43 to 48 shall govern the application of Schedule 2."
  },
  {
    "number": "43",
    "title": "Lessor\u2019s and lessee\u2019s costs",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "",
    "engineRule": null,
    "content": "(1)\n\nNotwithstanding any custom or practice to the contrary, a party to a lease shall, unless the parties thereto agree otherwise in writing, be under no obligation to pay the whole or part of any other party\u2019s advocate\u2019s costs of or relating to the preparation, execution or registration of the lease, but nevertheless the costs and expenses of having the lease duly stamped and registered shall be borne by the lessee.\n\n(2)\n\nIn this Rule\u2014\n\n(a)\n\n\"lease\" includes a letting and an under-lease and also an agreement for a lease, letting or under-lease or for a tenancy or sub-tenancy;\n\n(b)\n\n\"costs\" includes fees, charges, disbursements and remuneration."
  },
  {
    "number": "44",
    "title": "Printed or stereotyped leases",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "Stereotyped Leases (-1/3rd)",
      "description": "When 2 or more leases in common form are granted, lessor's fee is reduced by one-third (33.33%).",
      "formula": "LessorFee = Schedule2Fee * (2/3)"
    },
    "content": "Where an advocate acting on behalf of a lessor who is granting or proposing to grant two or more leases in common form makes use of a printed or stereotyped form of engrossment of lease the fee payable to such advocate in respect of each such lease under Schedule 2 shall be reduced by one-third."
  },
  {
    "number": "45",
    "title": "Charges where advocate is concerned for both lessor and lessee",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 8/1965, Sch.]",
    "engineRule": {
      "rule": "Dual Representation on Lease",
      "description": "Charge full lessor's charges PLUS one-half (50%) of lessee's charges.",
      "formula": "TotalFee = LessorFee + (0.5 * LesseeFee)"
    },
    "content": "Where an advocate is concerned for both lessor and lessee, he shall be entitled to charge the lessor\u2019s advocate\u2019s charges and one-half of those of the lessee\u2019s advocate."
  },
  {
    "number": "46",
    "title": "Where mortgagor joins in a conveyance",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 37/1977, s. 6.]",
    "engineRule": null,
    "content": "Where a mortgagor or mortgagee joins in a conveyance or lease, the vendor\u2019s or lessor\u2019s advocate may charge an additional fee of Sh. 120 for obtaining the concurrence of the party so joining."
  },
  {
    "number": "47",
    "title": "Where third party joining in conveyance or lease is separately represented",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Where a party other than a vendor or lessor joins in a conveyance or lease, and is represented by a separate advocate, the charges of such separate advocate shall be calculated under Schedule 5."
  },
  {
    "number": "48",
    "title": "Where consideration for conveyance or lease consists partly of premium and partly of rent",
    "part": "part_II",
    "partTitle": "Part II \u2013 Non-Contentious Matters",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "Lease with Premium & Rent",
      "description": "Charge Schedule 2 on rent PLUS Schedule 1 purchase fee on the premium.",
      "formula": "TotalFee = Schedule2Fee(Rent) + Schedule1Fee(Premium)"
    },
    "content": "Where a conveyance or lease is partly in consideration of a money payment or premium and partly of a rent, then, in addition to the remuneration prescribed under Schedule 2 by reference to the rent, there shall be paid a further sum equal to the remuneration under Schedule 1 on a purchase at a price equal to such money payment or premium."
  },
  {
    "number": "49",
    "title": "Application of Part III",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "(1)\n\nThis Part shall apply to contentious matters and the taxation of costs as between advocate and client and between party and party in contentious and other proceedings.\n\n(2)\n\nIn this Part, the expression \"the Court\" means the High Court or any judge thereof or a resident Magistrate Court or any magistrate sitting as a member of a resident Magistrate Court."
  },
  {
    "number": "49A",
    "title": "Costs in criminal cases",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 73/1983, s. 5, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Costs in criminal cases, whether in the High Court or subordinate courts, if not agreed or ordered, shall be taxed as between advocate and client under Schedule 5."
  },
  {
    "number": "50",
    "title": "Costs in High Court according to Schedule 6",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 56/1972, s. 11, L.N. 73/1983, s. 6, L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "High Court Costs Taxation",
      "description": "Taxed in accordance with Schedule 6. Lower scale applies unless higher scale certified under \u00a750A.",
      "formula": "Schedule 6 Party & Party Scale"
    },
    "content": "Subject to paragraphs 22 and 58 and to any order of the court in the particular case, a bill of costs in proceedings in the High Court shall be taxable in accordance with Schedule 6 and, unless the court has made an order under paragraph 50A, where Schedule 6 provides a higher and a lower scale the costs shall be taxed in accordance with the lower scale."
  },
  {
    "number": "50A",
    "title": "Schedule 6 costs on the higher scale",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 56/1972, s. 12, L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "Higher Scale Order on Special Grounds",
      "description": "Court may order taxation on higher scale for exceptional difficulty, importance or urgency.",
      "formula": "Schedule 6 Higher Scale"
    },
    "content": "The court may make an order that costs are to be taxed on the higher scale in Schedule 6 on special grounds arising out of the nature and importance or the difficulty or urgency of the case. The higher scale may be allowed either generally in any cause or matter or in respect of any particular application made or business done."
  },
  {
    "number": "51",
    "title": "Costs in subordinate courts according to Schedule 7",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 56/1972, s. 13, L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "Subordinate Courts Taxation",
      "description": "Taxed under Schedule 7. Lower scale if undefended, Higher scale if defended.",
      "formula": "Schedule 7 Lower vs Higher Scale"
    },
    "content": "Subject to paragraph 22, the scale of costs applicable to proceedings in subordinate courts (other than Kadhi\u2019s Courts) is that set out in Schedule 7."
  },
  {
    "number": "51A",
    "title": "Costs in Tribunal under Cap. 301",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 198/1969, s. 2, L.N. 56/1972, s. 14, L.N. 73/1983, s. 7, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Subject to paragraph 22, the scale of costs applicable to proceedings in a Tribunal appointed under the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act is that set out in Schedule 8."
  },
  {
    "number": "51B",
    "title": "Costs in Tribunal under Cap. 296",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 62/1979, s. 12, L.N. 73/1983, s. 7, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Subject to paragraph 22, the scale of costs applicable to proceedings in a Tribunal establishment under the Rent Restriction Act (Cap. 296) is that set out in Schedule 9."
  },
  {
    "number": "51C",
    "title": "Costs in probate and administration cases",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 73/1983, s. 8, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "Subject to paragraph 22, the scale of costs applicable to proceedings concerning probate and the administration of estates is that set out in Schedule 10."
  },
  {
    "number": "51D",
    "title": "",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 35/2014, r. 6.]",
    "engineRule": null,
    "content": "Subject to paragraph 22, the remuneration applicable to proceedings before Tribunals other than those under schedules 8 and 9 of this Order except where otherwise prescribed under the Act setting up the Tribunal, is that set out in Schedule 11."
  },
  {
    "number": "52",
    "title": "Costs to be taxed as between party and party unless otherwise directed",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "The costs awarded by the Court on any matter or application shall be taxed and paid as between party and party unless the Court in its order shall have otherwise directed."
  },
  {
    "number": "53",
    "title": "No advocate\u2019s costs where suit brought without notice except on special order",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "If the plaintiff in any action has not given the defendant notice of his intention to sue, and the defendant pays the amount claimed or found due at or before the first hearing, no advocate\u2019s costs shall be allowed except on a special order of the judge or magistrate."
  },
  {
    "number": "54",
    "title": "Costs on an opposed application",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "In the absence of any express direction costs of an opposed motion or other application (other than an action) shall follow the event, and shall be taxed as between party and party."
  },
  {
    "number": "55",
    "title": "Costs out of estate of minor, etc",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "The Court may order costs to be borne by the estate of a minor, lunatic, insolvent or deceased person and may give such directions as may be necessary to secure the due payment thereof."
  },
  {
    "number": "56",
    "title": "Court may fix costs or record consent order as to costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "The Court may of its own motion fix a sum to be paid in lieu of taxed costs and shall, at the request of all parties to any proceedings, record as an integral part of the final order or judgment therein, the agreement of the parties as to the amount of costs to be paid in pursuance of the Court\u2019s order or judgment unless the Court, for reasons to be recorded, considers that the amount so agreed is exorbitant or unreasonable."
  },
  {
    "number": "57",
    "title": "Registrar to record consent order as to costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 8/1965, Sch.]",
    "engineRule": null,
    "content": "(1)\n\nIf, after the disposal of any proceedings by the Court, the parties thereto agree the amount of costs to be paid in pursuance of the Court\u2019s order or judgment therein, the parties may in lieu of filling a bill of costs and proceeding to taxation thereof, request the registrar by joint letter to record their agreement and unless he considers the amount agreed upon to be exorbitant the registrar shall do so upon payment of the same court fee as is payable on the filling of any document for which no special fee is prescribed.\n\n(2)\n\nSuch agreement where recorded shall have the same force and effect as a certificate of taxation by the taxing officer:\n\nProvided that if the taxing officer shall consider the amount so agreed upon to be exorbitant he may direct the said costs to be taxed in accordance with this Order and the provisions of rule 11 shall apply in regard to every such taxation."
  },
  {
    "number": "58",
    "title": "Costs in High Court may be restricted to subordinate courts\u2019 scale",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 73/1983, s. 9.]",
    "engineRule": null,
    "content": "In causes or matters which, having regard to the amount recovered or paid in settlement or the relief awarded, could have been brought in a resident magistrate\u2019s or other subordinate court, costs on the scale application to subordinate courts only shall be allowed unless the judge otherwise orders."
  },
  {
    "number": "59",
    "title": "Costs of more than one advocate may be certified by the judge",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "(1)\n\nThe costs of more than one advocate may be allowed on the basis hereinafter provided in causes or matters in which the judge at the trial or on delivery of judgment shall have certified under his hand that more than one advocate was reasonable and proper having regard, in the case of a plaintiff, to the amount recovered or paid in settlement or the relief awarded or the nature, importance or difficulty of the case and, in the case of a defendant, having regard to the amount sued for or the relief claimed or the nature, importance or difficulty of the case.\n\n(2)\n\nA certificate may be granted under this rule in respect of two members or employees of the same firm."
  },
  {
    "number": "60",
    "title": "Judge may certify for costs of Queen\u2019s Counsel and Junior Counsel",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 35/2014, s. 3.]",
    "engineRule": {
      "rule": "Senior Counsel & Junior Counsel Certification",
      "description": "Senior Counsel certificate increases instruction fee by 50% (+50%) and doubles other charges.",
      "formula": "SeniorCounselFee = InstructionFee * 1.5; OtherCharges * 2"
    },
    "content": "(1)\n\nIn any cause or matter where an order for costs is made in favour of a party whose case has been conducted or led by one of Her Majesty\u2019s Counsel, additional costs provided in Schedule 6 shall be allowed if the judge at the trial or on delivery of judgment shall have certified under his hand that the employment of Queen\u2019s Counsel was reasonable and proper having regard, in the case of a plaintiff, to the amount recovered or paid in settlement or the relief awarded or the nature, importance or difficulty of the case, and, in the case of a defendant, having regard to the amount sued for or the relief claimed or the nature, importance or difficulty of the case.\n\n(2)\n\nA certificate for Queen\u2019s Counsel (with or without Junior Counsel) may be granted notwithstanding that he is a member of the firm of advocates by whom he was instructed.\n\n(3)\n\nA certificate for Junior Counsel (with or without Queen\u2019s Counsel) may be granted notwithstanding that he is a member or employee of the firm of advocates by whom he was instructed."
  },
  {
    "number": "61",
    "title": "Costs improperly incurred by advocate",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "(1)\n\nIf in any case it appears to the Court or a judge that costs have been incurred improperly or without reasonable cause, or that by reason of any undue delay in proceedings under any judgment or order, or of any misconduct or default of the advocate, any costs properly incurred have proved fruitless to the party on whose behalf the same were incurred, the Court or judge may call on the advocate by whom such costs have been so incurred to show cause why such costs should not be disallowed as between the advocate and his client, and also (if the circumstances of the case shall require) why the advocate should not repay to his client any costs which his client may have been ordered to pay to any other person, and thereupon may make such order as the justice of the case may require.\n\n(2)\n\nThe Court or judge may in any case refer the matter to a taxing officer for inquiry and report and direct the advocate in the first place to show cause before such taxing officer."
  },
  {
    "number": "62",
    "title": "Costs where same advocate is employed by two or more plaintiffs or defendants",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "Where the same advocate is employed for two or more plaintiffs or defendants, and separate pleadings are delivered or other proceedings had by or for two or more such plaintiffs or defendants separately, the taxing officer shall consider in the taxation of such advocate\u2019s bill of costs, either between party and party or between advocate and client, whether such separate pleadings or other proceedings were necessary or proper, and if he is of opinion that any part of the costs occasioned thereby have been unnecessarily or improperly incurred, the same shall be disallowed."
  },
  {
    "number": "62A",
    "title": "Costs where there has been a change of advocates",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 37/1977, s. 7.]",
    "engineRule": null,
    "content": "(1)\n\nWhere there has been a change of advocates or more than one change of advocates, the advocate finally on the record shall draw a single bill for the whole of the matter in respect of which costs have been awarded.\n\n(2)\n\nOn taxing the bill the taxing officer shall take into account the following principles, that the bill shall not be larger than if a single advocate had been employed and that the party taxing the bill shall not obtain indemnity for costs which he has not paid.\n\n(3)\n\nThe bill shall be accompanied by a certificate setting out the dates during which all advocates acted, together with all agreements for remuneration made with them, all sums paid to them for costs and whether those sums were paid in full settlement."
  },
  {
    "number": "63",
    "title": "Costs between party and party where joint executors or trustees defend separately may be restricted",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "In taxing as between party and party the costs of joint executors or trustees who defend separately, the taxing officer shall, unless otherwise ordered by the Court or judge, allow only one set of costs for such defendants when he is of opinion that they ought to have joined in their defence, such costs to be apportioned among them as the taxing officer shall deem fit."
  },
  {
    "number": "64",
    "title": "Appearance in Court or chambers of party not interested",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "Where any party appears upon any application or proceedings in Court or in chambers in which he is not interested or upon which, according to the practice of the Court, he ought not to attend, he shall not be allowed any costs of such appearance unless the Court or judge shall otherwise order."
  },
  {
    "number": "65",
    "title": "Limits of time for taxation",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 37/1977, s. 8, L.N. 268/2017, s. 2.]",
    "engineRule": null,
    "content": "(1)\n\nAt any time after 14 days from the making of an order for the payment forthwith of costs when taxed, any party liable to pay the costs may give not less than one calendar month\u2019s notice to the party entitled to tax his bill to do so. The notice shall be filed and delivered.\n\n(2)\n\nIf the party entitled to tax his bill does not file his bill for taxation within the time limited by the notice, the taxing officer, on the application in writing of any person liable to pay such costs, may notify the party in delay that the bill will not be taxed unless the time for filing shall have been extended by the taxing officer or the court, which extension may be granted either before or after the expiry of the notice.\n\n(3)\n\nThe period excluded by Order 50, rule 3 of the Civil Procedure Rules (Cap. 21, Sub. Leg.) is excluded for the purposes of this paragraph."
  },
  {
    "number": "66",
    "title": "Taxation of costs upon an award",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "Costs may be taxed upon an award in an arbitration notwithstanding that the time for setting aside the award has not elapsed."
  },
  {
    "number": "67",
    "title": "Receiver in insolvency to have notice of taxation",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "In insolvency matters the registrar shall give to the receiver the usual notice of the appointment to tax any bill of costs relating to the insolvency between party and party and the advocate or party lodging the bill shall on application furnish the receiver with a copy thereof, on payment of the proper fee, which payment may be charged to the estate."
  },
  {
    "number": "68",
    "title": "Advocate of insolvent petitioner to give credit for deposit towards costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "An advocate in the matter of an insolvency petition presented by the insolvent himself shall, in his bill of costs, give credit for such sum or security, if any, as he may have received from the debtor, as a deposit on account of the costs and expenses to be incurred in and about the filing and prosecution of such petition; and the amount of any such deposit shall be deducted by the taxing officer in arriving at the amount for which his certificate of taxation issues."
  },
  {
    "number": "68A",
    "title": "Certificate of costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 227/1967, s. 3, L.N. 56/1972, s. 15, L.N. 73/1983, s. 10, L.N. 35/2014, s. 3, L.N. 268/2017, s. 3.]",
    "engineRule": {
      "rule": "Certificate of Costs in Default Judgment",
      "description": "Registrar issues certificate of costs under Schedule 6 Item 15 without filing bill.",
      "formula": "Schedule 6 Item 15 fixed tariff"
    },
    "content": "(1)\n\nNotwithstanding anything to the contrary in this Order, when the Registrar of the High Court enters final judgment under Order 49, rule 2 of the Civil Procedure Rules (Cap. 21, Sub. Leg.), he may, on application in writing and without the filing or taxation of a bill of costs or of notice to any party, sign a certificate of the costs of the suit calculated in accordance with item 15 of Schedule 6.\n\n(2)\n\nAn advocate may, in any case in lieu of taxation, apply in writing for a certificate under this paragraph.\n\n(3)\n\nIf the Registrar refuses an application under this paragraph he shall on request certify his refusal in writing to the applicant and the applicant may within fourteen days of receipt of the certificate give notice of objection, whereupon paragraph 11 shall apply."
  },
  {
    "number": "68B",
    "title": "Limitation of costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 227/1967, s. 3.]",
    "engineRule": null,
    "content": "Where in any case to which rule 68A could apply, no increase on the scale fee is obtained on a bill of costs lodged for taxation under rule 70, no further costs shall be allowed than would have been allowed under rule 68A."
  },
  {
    "number": "69",
    "title": "Manner of preparing bills for taxation",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": {
      "rule": "Statutory 5-Column Bill of Costs Format",
      "description": "Col 1: Dates; Col 2: Item No; Col 3: Particulars; Col 4: Professional Charges; Col 5: Taxing Officer Deductions.",
      "formula": "5-Column Statutory Accounting"
    },
    "content": "(1)\n\nBills of costs for taxation shall be prepared in five columns in manner following\u2014\n\n(a)\n\nthe first or left-hand column for dates, showing year, month and day;\n\n(b)\n\nthe second column for the items, which shall be serially numbered;\n\n(c)\n\nthe third column for the particulars of the services charged for;\n\n(d)\n\nthe fourth column for the professional charges claimed; and\n\n(e)\n\nthe fifth column for the taxing officer\u2019s deductions.\n\n(2)\n\nDisbursements shall be shown separately at the foot of the bill.\n\n(3)\n\nFees for attending taxation shall not be included in the body of the bill, but the item shall appear at the end, and the amount left blank for completion by the taxing officer."
  },
  {
    "number": "70",
    "title": "Filing bills for taxation",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "Every bill of costs of taxation shall be lodged with the registrar and shall be endorsed with the name and address of the advocate by whom it is lodged, and also the name and address of the advocate (if any) for whom he is agent, and the name and address of any advocate or other person entitled to receive notice of the taxation. Every such bill shall be accompanied by one carbon or other true copy thereof for each name endorsed thereon of any advocate or other person entitled to receive such notice."
  },
  {
    "number": "71",
    "title": "Bills not to be altered after being lodged",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "No addition or alteration shall be made in a bill of costs by the party submitting the same after the bill has been lodged for taxation, except by consent of the parties, or by permission or direction of the Court or taxing officer."
  },
  {
    "number": "72",
    "title": "Notice of taxation to be given by taxing officer",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "When a bill of costs has been lodged for taxation as aforesaid the registrar shall, upon payment of the fee prescribed, issue to the party lodging the bill a notice of the date and time (being not less than five days after the issue of such notice, unless a shorter time is specially allowed by the registrar) fixed for taxation thereof and shall also issue a copy of such notice, accompanied by a copy of the bill, to each advocate and other person whose name is endorsed on the bill as entitled to receive notice of the taxation thereof:\n\nProvided that where any person so entitled to receive notice cannot be found at his last-known address for service the taxing officer may in his discretion by order in writing dispense with service of notice upon such person."
  },
  {
    "number": "73",
    "title": "No notice of taxation where party has not appeared",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 73/1983, s. 11, L.N. 35/2014, s. 3.]",
    "engineRule": null,
    "content": "(1)\n\nIt shall not be necessary for notice of taxation of costs to be given to a party against whom such costs are being taxed in any case in which such party has not appeared in person or by advocate.\n\n(2)\n\nWhere an advocate has withdrawn, the provisions of Order 3, rule 12 of the Civil Procedure Rules (Cap. 21, Sub. Leg.)"
  },
  {
    "number": "74",
    "title": "Vouchers to be produced",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 37/1977, s. 9.]",
    "engineRule": null,
    "content": "Subject to paragraph 74A, receipts or vouchers for all disbursements charged in a bill of costs shall be produced on taxation if required by the taxing officer."
  },
  {
    "number": "74A",
    "title": "Witness expenses",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 37/1977, s. 9.]",
    "engineRule": null,
    "content": "(1)\n\nThe taxing officer shall allow reasonable charges and expenses of witnesses who have given evidence and shall take into account all circumstances and without prejudice to the generality of the foregoing, the following factors\u2014\n\n(a)\n\nthe loss of time of the witness;\n\n(b)\n\nif the witness is a party, the time spent giving evidence;\n\n(c)\n\nthe loss of wages or salary to the witness or his employer while attending court;\n\n(d)\n\nthe cost of travelling, board and lodging in accordance with the status of the witness;\n\n(e)\n\nwhere the witness is a professional man, any scale fees by which he may charge for his time or attendance;\n\n(f)\n\nif the witness came from abroad, whether this was a reasonable means of obtaining his evidence after considering the importance or otherwise of his evidence;\n\n(g)\n\nwhere the witness is an expert witness as defined by the Evidence Act (Cap. 80) and has given evidence, a fee for qualifying to give evidence where he has reasonably had to spend time, effort or money in investigating the particular matter on which he gave evidence.\n\n(2)\n\nThe taxing officer shall allow reasonable charges and expenses in respect of any person not actually called as a witness whose attendance has been certified as necessary by the Judge."
  },
  {
    "number": "75",
    "title": "Numbering of folios on documents charged by the folio",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "[L.N. 73/1983, s. 12.]",
    "engineRule": null,
    "content": "(1)\n\nAll drafts and other documents or copies thereof, the preparation of which is charged for, shall be produced at taxation if required by the taxing officer.\n\n(2)\n\nThe length of all documents not vouched by production of the original or copies thereof or other evidence satisfactory to the taxing officer may be certified by the advocate in writing, and if such certificate be found by the taxing officer to be erroneous, the taxing officer may disallow the cost of the document so erroneously certified or any part thereof."
  },
  {
    "number": "76",
    "title": "Taxing officer may proceed ex parte and extend or limit time or adjourn",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "The taxing officer shall have power to proceed to taxation ex parte in default of appearance of either or both parties or their advocates, and to limit or extend the time for any proceeding before him, and for proper cause to adjourn the hearing of any taxation from time to time."
  },
  {
    "number": "77",
    "title": "Where more than one-sixth taxed off",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": {
      "rule": "One-Sixth (1/6th) Disallowance Penalty",
      "description": "If more than 1/6th (16.67%) of bill of costs (exclusive of court fees) is taxed off, taxing costs may be disallowed.",
      "formula": "TaxedOffRatio = DisallowedAmount / TotalBilledAmount; if > (1/6) -> Penalty"
    },
    "content": "(1)\n\nIf more than one-sixth of the total amount of a bill of costs, exclusive of court fees, be disallowed on taxation, the party presenting the bill for taxation may, in the discretion of the taxing officer, be disallowed the costs of such taxation.\n\n(2)\n\nThe decision of the taxing officer under this rule shall be final."
  },
  {
    "number": "78",
    "title": "[Deleted by L.N. 73/1983, s. 13.]",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": ""
  },
  {
    "number": "79",
    "title": "Instructions of judge as to costs",
    "part": "part_III",
    "partTitle": "Part III \u2013 Taxation of Costs",
    "notes": "",
    "engineRule": null,
    "content": "The judge may, for special reasons to be certified by him, allow an advocate\u2019s costs in any case in which costs are not allowed under the foregoing rules, and may allow costs in addition to the costs provided by this Order, or may refuse to allow an advocate\u2019s costs, or may allow costs at a lower rate than that provided by this Order."
  }
];

export const STATUTORY_SCHEDULES_FULL: StatutoryScheduleDetail[] = [
  {
    "scheduleNumber": 1,
    "title": "SCHEDULE 1 \u2013 Scale Fees on Sales, Purchases, Mortgages & Negotiating",
    "shortTitle": "Schedule 1: Conveyancing & Mortgages",
    "legalRef": "LN 35/2014, LN 50/2009, LN 159/2006",
    "category": "Conveyancing",
    "scales": [
      {
        "name": "First Scale: Sales & Purchases of Immovable Property",
        "type": "cumulative",
        "rules": [
          "Kshs. 1 to Kshs. 5,000,000: 2% (Minimum Kshs. 35,000)",
          "Kshs. 5,000,001 to Kshs. 100,000,000: First tier fee (Kshs. 100,000) + 1.5% on balance",
          "Kshs. 100,000,001 to Kshs. 250,000,000: Prior tiers (Kshs. 1,525,000) + 1.25% on balance",
          "Kshs. 250,000,001 to Kshs. 1,000,000,000: Prior tiers (Kshs. 3,400,000) + 1.0% on balance",
          "Over Kshs. 1,000,000,000: Prior tiers (Kshs. 10,900,000) + 0.1% on excess balance"
        ],
        "notes": "Vendor and Purchaser advocates each charge this scale. If vendor's advocate does not prepare agreement for sale, fee is reduced by 1/3 (\u00a718(a))."
      },
      {
        "name": "Second Scale: Debentures, Mortgages or Charges",
        "type": "cumulative",
        "rules": [
          "Grantee Creation: Kshs. 1 - 2.5M: 2% (Min Kshs. 28,000); 2.5M - 5M: +1.75%; 5M - 100M: +1.0%; 100M - 250M: +0.75%; 250M - 1B: +0.15%; Over 1B: +0.1%",
          "Grantee Discharge: With undertaking: 25% of creation fee (Min Kshs. 15,000); Without undertaking: 15% (Min Kshs. 10,000)",
          "Grantor Creation: 50% of Grantee creation scale fee",
          "Grantor Discharge: 25% of Grantee creation scale fee (Min Kshs. 15,000)"
        ],
        "notes": "Equitable mortgage: 50% of scale fee (Min Kshs. 12,500). Multiple securities: principal 100% + 25% first additional + 10% subsequent."
      },
      {
        "name": "Third Scale: Negotiating Commissions",
        "type": "stepped",
        "rules": [
          "First Kshs. 200,000: Kshs. 112 per Kshs. 2,000 (5.6%)",
          "Over Kshs. 200,000 to Kshs. 600,000: Kshs. 52 per Kshs. 2,000 (2.6%)",
          "Over Kshs. 600,000: Kshs. 30 per Kshs. 2,000 (1.5%)"
        ],
        "notes": "Fractions of Kshs. 2,000: up to 1,000 counts as 1/2 unit; over 1,000 counts as 1 whole unit."
      }
    ]
  },
  {
    "scheduleNumber": 2,
    "title": "SCHEDULE 2 \u2013 Leases, Agreements for Leases and Tenancy Agreements at a Rack Rent",
    "shortTitle": "Schedule 2: Commercial & Residential Leases",
    "legalRef": "LN 35/2014, LN 50/2009",
    "category": "Leases",
    "scales": [
      {
        "name": "Preparation of Lease (Lessor's Advocate)",
        "type": "stepped",
        "rules": [
          "Annual Rent Kshs. 1 to Kshs. 500,000: 15% of annual rent (Minimum Kshs. 20,000)",
          "Annual Rent Kshs. 500,001 to Kshs. 3,000,000: Base tier fee (Kshs. 75,000) + 3% on balance",
          "Annual Rent Over Kshs. 3,000,000: Prior tiers (Kshs. 150,000) + 1% on excess balance"
        ],
        "notes": "Calculated on highest annual rent reserved if varying rent is payable (Note 1). Note 4 non-cumulative band rule clarified by case law."
      },
      {
        "name": "Perusing, Amending and Completing (Lessee's Advocate)",
        "type": "percentage",
        "rules": [
          "50% of the fees payable to the advocate preparing the lease under item 1."
        ],
        "notes": "If advocate represents both lessor and lessee, charge full lessor fee + 50% lessee fee (\u00a745)."
      }
    ]
  },
  {
    "scheduleNumber": 3,
    "title": "SCHEDULE 3 \u2013 Formation, Incorporation and Registration of Companies",
    "shortTitle": "Schedule 3: Company Formation",
    "legalRef": "LN 35/2014",
    "category": "Corporate",
    "scales": [
      {
        "name": "Company Formation & Registration",
        "type": "fixed_min",
        "rules": [
          "Formation & Incorporation of company with share capital: Agreed fee taking into account complexity, Minimum Kshs. 60,000",
          "Registration of foreign companies: Agreed fee, Minimum Kshs. 60,000",
          "Other company secretarial & transactional work: Charged under Schedule 5"
        ],
        "notes": "Fee covers instructions, memorandum & articles, filing statutory forms at Business Registration Service (BRS), and procuring certificate."
      }
    ]
  },
  {
    "scheduleNumber": 4,
    "title": "SCHEDULE 4 \u2013 Trade Marks Practice & Registry Proceedings",
    "shortTitle": "Schedule 4: Trade Marks",
    "legalRef": "LN 35/2014",
    "category": "Intellectual Property",
    "scales": [
      {
        "name": "Statutory Trade Mark Tariff",
        "type": "itemized",
        "rules": [
          "Registration of one trade mark in one class: Kshs. 42,000",
          "Simultaneous second & subsequent marks in same class: Kshs. 29,000 each",
          "Priority application filing: Kshs. 4,000",
          "Registered user entry: First mark Kshs. 40,000; Second mark Kshs. 18,900; 3rd & subsequent Kshs. 2,600",
          "Trade mark assignment (first mark): Kshs. 25,000; second Kshs. 15,000; subsequent Kshs. 12,000",
          "Trade mark renewal: First mark Kshs. 25,000; simultaneous subsequent Kshs. 12,600",
          "Opposition & Rectification proceedings before Registrar: Minimum Kshs. 210,000",
          "Hearing attendance before Registrar: Whole day Kshs. 16,464; Half day Kshs. 8,232"
        ],
        "notes": "Includes routine correspondence and filing. Objections and hearings charged separately on time basis under Schedule 5."
      }
    ]
  },
  {
    "scheduleNumber": 5,
    "title": "SCHEDULE 5 \u2013 Hourly Rate, Itemized Charges & Alternative Method of Assessment",
    "shortTitle": "Schedule 5: Hourly & General Matters",
    "legalRef": "LN 35/2014",
    "category": "General Practice",
    "scales": [
      {
        "name": "Part I: Agreed Hourly Rates",
        "type": "hourly",
        "rules": [
          "Advocates may agree on hourly rates with clients in writing from time to time.",
          "Applies to general advisory, complex transactions, uncompleted matters, and Schedule 5 elections under \u00a722."
        ],
        "notes": "Election to charge Schedule 5 must be communicated to client before or contemporaneously with delivery of bill (\u00a722)."
      },
      {
        "name": "Part II: Statutory Itemized Tariff",
        "type": "itemized",
        "rules": [
          "Instructions: Reasonable fee taking into account care, complexity, volume and value",
          "Drawing documents: Kshs. 250 per folio (100 words)",
          "Engrossing documents: Kshs. 50 per folio",
          "Fair copying: Kshs. 30 per folio | Perusing: Kshs. 70 per folio",
          "Attendances (ordinary): Kshs. 1,000 per 15 minutes or part thereof",
          "Routine telephone calls within Kenya: Kshs. 150 per 15 minutes",
          "Time engaged (in lieu of itemized work): Kshs. 7,000 per 15 minutes",
          "Correspondence: Letters Kshs. 300 (or Kshs. 200 per folio); Perusal of letters Kshs. 150 (or Kshs. 70 per folio)",
          "Formal written opinions: Minimum Kshs. 35,000",
          "Journey from home: Full day (>=7 hrs) Kshs. 15,000; Lesser time Kshs. 2,500/hour",
          "Debt Collection Scale: Up to 100k (10%); 100k-500k (10k + 5%); 500k-2M (50k + 3%); Over 2M (100k + 1.5%)"
        ],
        "notes": "Folio is strictly 100 words (\u00a717). A sum in figures is 3 words."
      }
    ]
  },
  {
    "scheduleNumber": 6,
    "title": "SCHEDULE 6 \u2013 Costs of Proceedings in the High Court",
    "shortTitle": "Schedule 6: High Court Litigation",
    "legalRef": "LN 35/2014, LN 268/2017",
    "category": "Litigation",
    "scales": [
      {
        "name": "Item 1: Instruction Fees (High Court)",
        "type": "value_table",
        "rules": [
          "Undefended Suits (No Defence Filed):\n  \u2022 Up to Kshs. 500,000: Kshs. 45,000\n  \u2022 500,001 - 750,000: Kshs. 65,000\n  \u2022 750,001 - 1,000,000: Kshs. 75,000\n  \u2022 1,000,001 - 20,000,000: Kshs. 75,000 + 1.75% on balance\n  \u2022 Over Kshs. 20,000,000: Kshs. 407,500 + 1.5% on balance",
          "Defended Suits (Defence or Denial Filed):\n  \u2022 Up to Kshs. 500,000: Kshs. 75,000\n  \u2022 500,001 - 750,000: Kshs. 90,000\n  \u2022 750,001 - 1,000,000: Kshs. 120,000\n  \u2022 1,000,001 - 20,000,000: Kshs. 120,000 + 2.0% on balance\n  \u2022 Over Kshs. 20,000,000: Kshs. 500,000 + 1.5% on balance",
          "Summary Determinations without trial: 75% of Item 1(b) fee",
          "Settlement reached before confirmation of trial date: 85% of Item 1(b) fee"
        ],
        "notes": "Election Petitions: Minimum Kshs. 500,000. Constitutional Petitions: Min Kshs. 45,000 (uncontested) / Kshs. 100,000 (opposed). Getting Up Fee: Not less than 1/3 of instruction fee."
      },
      {
        "name": "Part B: Advocate and Client Costs",
        "type": "percentage_uplift",
        "rules": [
          "As between Advocate and Client, the minimum fee shall be Party and Party costs INCREASED BY 50% (+50%).",
          "Applies to fees prescribed in Part A, fees ordered by Court, or fees agreed under paragraph 57."
        ],
        "notes": "The 50% increase covers all proper attendances on the client and necessary client correspondence."
      }
    ]
  },
  {
    "scheduleNumber": 7,
    "title": "SCHEDULE 7 \u2013 Costs of Proceedings in Subordinate Courts",
    "shortTitle": "Schedule 7: Subordinate Courts",
    "legalRef": "LN 35/2014, LN 45/2014",
    "category": "Litigation",
    "scales": [
      {
        "name": "Item 1: Instruction Fees (Subordinate Courts)",
        "type": "value_table",
        "rules": [
          "Up to Kshs. 50,000: Lower Scale Kshs. 10,000 | Higher Scale Kshs. 15,000",
          "Kshs. 50,001 to 100,000: Lower Scale Kshs. 15,000 | Higher Scale Kshs. 30,000",
          "Kshs. 100,001 to 200,000: Lower Scale Kshs. 30,000 | Higher Scale Kshs. 40,000",
          "Kshs. 200,001 to 500,000: Lower Scale Kshs. 45,000 | Higher Scale Kshs. 65,000",
          "Kshs. 500,001 to 1,000,000: Lower Scale Kshs. 65,000 | Higher Scale Kshs. 90,000",
          "Kshs. 1,000,001 to 2,000,000: Lower Scale Kshs. 90,000 | Higher Scale Kshs. 120,000",
          "Over Kshs. 2,000,000: Fee for 2M (Kshs. 120,000) + 2.5% on excess balance"
        ],
        "notes": "Lower Scale applies where no defence is filed; Higher Scale applies in all defended matters. Advocate & Client costs: Part A + 50%."
      }
    ]
  },
  {
    "scheduleNumber": 8,
    "title": "SCHEDULE 8 \u2013 Costs in Tribunal under Landlord & Tenant Act (Cap. 301)",
    "shortTitle": "Schedule 8: Business Premises Tribunal",
    "legalRef": "LN 35/2014",
    "category": "Tribunals",
    "scales": [
      {
        "name": "Tribunal Instruction Fees",
        "type": "value_table",
        "rules": [
          "Up to Kshs. 10,000: Lower Scale Kshs. 1,293 | Higher Scale Kshs. 5,000",
          "Kshs. 10,001 to 20,000: Lower Scale Kshs. 2,000 | Higher Scale Kshs. 8,000",
          "Kshs. 20,001 to 50,000: Lower Scale Kshs. 8,000 | Higher Scale Kshs. 15,000",
          "Kshs. 50,001 to 100,000: Lower Scale Kshs. 15,000 | Higher Scale Kshs. 22,500",
          "Kshs. 100,001 to 250,000: Lower Scale Kshs. 22,500 | Higher Scale Kshs. 35,000",
          "Over Kshs. 250,000: Fee for 250k (Kshs. 35,000) + 2.0% on excess balance"
        ],
        "notes": "Getting up fee: Not less than 1/3 of instruction fee. Advocate & Client costs: Part A + 50%."
      }
    ]
  },
  {
    "scheduleNumber": 9,
    "title": "SCHEDULE 9 \u2013 Costs in Rent Restriction Tribunal (Cap. 296)",
    "shortTitle": "Schedule 9: Residential Rent Tribunal",
    "legalRef": "LN 35/2014",
    "category": "Tribunals",
    "scales": [
      {
        "name": "Rent Restriction Tribunal Fees",
        "type": "value_table",
        "rules": [
          "Up to Kshs. 1,000: Lower Kshs. 1,293 | Higher Kshs. 2,352",
          "Kshs. 1,001 - 2,000: Lower Kshs. 2,117 | Higher Kshs. 4,116",
          "Kshs. 2,001 - 3,500: Lower Kshs. 2,499 | Higher Kshs. 4,998",
          "Kshs. 3,501 - 5,000: Lower Kshs. 3,528 | Higher Kshs. 8,232",
          "Kshs. 5,001 - 7,500: Lower Kshs. 4,704 | Higher Kshs. 10,584",
          "Kshs. 7,501 - 10,000: Lower Kshs. 5,880 | Higher Kshs. 11,760",
          "Kshs. 10,001 - 20,000: Lower Kshs. 8,820 | Higher Kshs. 14,700",
          "Kshs. 20,001 - 50,000: Lower Kshs. 10,290 | Higher Kshs. 17,640",
          "Over Kshs. 50,000: Fee for 50k (Kshs. 17,640) + 2.0% on excess balance"
        ],
        "notes": "Subject matter: 1 year rent / mesne profits + arrears. Advocate & Client: +50%."
      }
    ]
  },
  {
    "scheduleNumber": 10,
    "title": "SCHEDULE 10 \u2013 Probate and Administration of Estates",
    "shortTitle": "Schedule 10: Probate & Succession",
    "legalRef": "LN 35/2014",
    "category": "Probate",
    "scales": [
      {
        "name": "Instruction Fees to Apply for Grant of Probate / Administration",
        "type": "capital_value",
        "rules": [
          "Gross Capital Value up to Kshs. 1,000,000: 5% of gross capital value",
          "Gross Capital Value over Kshs. 1,000,000: Kshs. 50,000 + 1% on excess over 1,000,000",
          "Re-sealing a grant: 4/5ths of the grant fee",
          "Confirmation of grant: Uncontested Kshs. 15,000 | Contested min Kshs. 30,000",
          "Contested proceedings for grant: Not less than twice (2x) the uncontested fee",
          "Caveats & renunciations: Kshs. 10,000 | Drawing Will: Min Kshs. 30,000",
          "Annual Estate Administration Commission: 2.5% on capital value; 3% on income; 1.5% on realized capital"
        ],
        "notes": "Advocate & Client costs: Party & Party + 50% (\u00a7B)."
      }
    ]
  },
  {
    "scheduleNumber": 11,
    "title": "SCHEDULE 11 \u2013 Proceedings Before Other Tribunals",
    "shortTitle": "Schedule 11: General Tribunals",
    "legalRef": "LN 35/2014",
    "category": "Tribunals",
    "scales": [
      {
        "name": "General Tribunal Scale",
        "type": "value_table",
        "rules": [
          "Kshs. 0 to 50,000: Kshs. 17,640",
          "Kshs. 50,001 to 100,000: Kshs. 23,520",
          "Kshs. 100,001 to 200,000: Kshs. 35,280",
          "Kshs. 200,001 to 500,000: Kshs. 58,800",
          "Kshs. 500,001 to 1,000,000: Kshs. 100,000",
          "Kshs. 1,000,001 to 20,000,000: Kshs. 100,000 + 1.0% on balance",
          "Kshs. 20,000,001 to 250,000,000: Kshs. 290,000 + 0.5% on balance",
          "Over Kshs. 250,000,000: Fee for 250M + 0.1% on excess",
          "Lower Scale: 50% of the above. Where value unascertainable: Min Kshs. 35,280"
        ],
        "notes": "Advocate & Client: Party & Party + 50%."
      }
    ]
  },
  {
    "scheduleNumber": 12,
    "title": "SCHEDULE 12 \u2013 Patents, Utility Models and Industrial Designs",
    "shortTitle": "Schedule 12: Patents & Industrial Designs",
    "legalRef": "LN 35/2014",
    "category": "Intellectual Property",
    "scales": [
      {
        "name": "Patent & Design Tariffs",
        "type": "itemized",
        "rules": [
          "Instructions to register one patent: Kshs. 42,000",
          "Instructions to register one industrial design: Kshs. 42,000",
          "Instructions to register one utility model: Kshs. 42,000",
          "National phase entry of international application: Kshs. 42,000",
          "Amendment of specification / claims: Kshs. 15,120",
          "Substantive examination application: Kshs. 6,048",
          "Licence registration: Kshs. 21,000 | Licence agreement drafting min Kshs. 12,600",
          "Infringement, rectification or opposition before Managing Director or Tribunal: Minimum Kshs. 210,000",
          "Tribunal hearing attendances: Full day Kshs. 16,464 | Half day Kshs. 8,232"
        ],
        "notes": "Includes routine correspondence and filings. Objections charged separately on time basis under Schedule 5."
      }
    ]
  }
];
