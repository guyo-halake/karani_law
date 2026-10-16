# P3L DEVELOPERS — SOVEREIGN COMMAND DASHBOARD MASTER TASK (TASK.md)
*System Architect & Founder: Guyo Halake | Marsabit Bare-Metal Node & Global Cloud Infrastructure*
*Last Updated: 2026-10-16*

---

## 🏛️ CORE PHILOSOPHY & NON-NEGOTIABLE RULES
1. **Never Invent False Totals**: All financial metrics must be real contract numbers in KES.
   - **Fresh Fity Supermarket POS** (Rosemary Wakonyo · Ruiru Town): Settled initial KES 32,000 + Ongoing KES 3,500/mo maintenance (Total settled to date: KES 63,500 via M-Pesa 0756111885).
   - **Sayara Aesthetics E-commerce** (Sarah Guyatu Rashid · Nairobi): Settled initial KES 10,000 + Ongoing sales commission (Total settled: KES 48,200).
   - **Sayara Shein API Daemon** (Port 8040): Standalone Python 3.11 microservice bundled under Sayara retainer (runs natively on razak-server).
   - **SUVPlanet Auto Traders** (Nairobi Showroom): Settled initial KES 5,500 + KES 400 / 2 months listing ads (Total settled: KES 6,700).
   - **Karani Law & BillsZip ERP** (Adv. Nyagah B. Kithinji · Upper Hill): Milestone Retainer Agreement · Stage 4 UAT Pending with real Supabase DB, FastAPI Schedule 6 statutory engine, and Azure ACR container.
   - **Nokras Hotel Platform** (Murang’a & Embu): Non-paying / Flagship P3L portfolio engineering showcase.
   - **Inner Circle Hedge Fund & Khaemba News**: P3L Internal proprietary systems.
2. **Infrastructure Telemetry Accuracy**:
   - **Local Physical Bare-Metal Node**: `razak-server` running Ubuntu Server 24.04 LTS (Marsabit Edge, x86_64).
     - Storage: **12 TB NAS Total Array** (4x 4TB Seagate IronWolf RAID 5 + 1TB NVMe OS).
       - Active Deployed Projects & Databases: 4.8 TB
       - Free Unallocated Storage: 2.8 TB
       - Stored Archive & Personal Media: 4.4 TB (Jellyfin Movies 2.3 TB, GTA Games & Modding Archive 1.6 TB, System Snapshots 0.5 TB)
     - Ambient & Thermal: 24.3°C ambient, ~86% compute load.
     - ISP / Internet: Dedicated Synchronous Fiber via **Adrian AK 3674**, dynamic live fluctuating telemetry.
     - Power Backup: Dual 100Ah Deep-Cycle Gel Batteries + APC 1500VA Smart-UPS (48h offline runtime).
   - **Local HomeLab Linux Node**: Arch Linux workstation connected 24/7 to Marsabit via WireGuard tunnel (`10.14.0.2` @ 12ms ping).
   - **Custom Built PC Workstation**: Planned high-spec sovereign AI training rig (AMD Ryzen 9 9950X, 64GB DDR5, RTX 4080 Super 16GB, dual 2TB NVMe RAID 0, 360mm liquid loop).
   - **Cloud VPS Array**: **Oracle Cloud VPS with 45 TB high-throughput block storage**:
     - Vol 1: /mnt/odin-weights (18 TB) - OdinBot LLM checkpoints & fine-tuning datasets
     - Vol 2: /mnt/kenya-law-corpus (12 TB) - Kenya Law Gazette, Cap 16, eKLR case law embeddings (1.84M chunks)
     - Vol 3: /mnt/sayara-lake (5 TB) - Shein catalog raw scraping cache, product image store
     - Vol 4: /mnt/backups-cold (8 TB) - Automated encrypted restic snapshots from razak-server
     - Vol 5: /mnt/kithinjilegal-vault (2 TB) - BillsZip encrypted affidavits, court pleadings, fee note records
3. **OdinBot AI Architecture**:
   - Proprietary Kenyan legal & systems LLM iterated continuously since 2023.
   - Hybrid Edge (8B LoRA on razak-server) + Cloud (70B MoE on Oracle Cloud VPS 45 TB).
   - Kenya Law statutory compliance (Cap 16 Advocates Remuneration Order), bilingual court audio transcription (Whisper Large-v3 Swahili/English), and live bank API mirrors.
   - Current Alert: Active debug state — *I&M Bank Mirror 502 Bad Gateway* (upstream proxy reset on `tcp://10.14.2.80:8443`).

---

## 🗄️ COMPLETE PROJECTS FLEET & MULTI-MONTH OPERATIONAL DOSSIERS

### 1. Commercial Client Projects (6)
1. **Fresh Fity Supermarket POS** (`prj-fresh-fity`)
   - Client: Rosemary Wakonyo · Ruiru Town (10 Months Live In-Store)
   - Contract: Initial KES 32,000 settled · KES 3,500/month ongoing maintenance & register support (Total settled: KES 63,500)
   - Stack: Electron, React, SQLite WAL (<4ms writes), Honeywell Orbit 7120 laser scanner, ESC/POS thermal printer daemon.
   - Key Incidents: Linux USB `/dev/usb/lp0` dropped after kernel update (fixed via `/etc/udev/rules.d/99-usb-printer.rules`), 200ms debounce on paper auto-cutter.
2. **Sayara Aesthetics E-commerce Storefront** (`prj-sayara-ecom`)
   - Client: Sarah Guyatu Rashid · Nairobi (14 Months Live)
   - Contract: Initial KES 10,000 setup settled · % sales commission (Total settled: KES 48,200)
   - Stack: Next.js 14, Tailwind CSS, Vercel Edge, Supabase PostgreSQL, Safaricom Daraja 2.0 STK push.
   - Key Incidents: Daraja ResultCode 1032 user cancellations handled gracefully, Cloudflare CDN caching rule for influencer traffic bursts.
3. **Sayara Shein Python API Daemon** (`prj-sayara-daemon`)
   - Client: Sarah Guyatu Rashid · Port 8040 (13 Months Continuous Cron)
   - Architecture: Python 3.11, FastAPI, Playwright Headless, Redis, Celery on razak-server.
   - Key Incidents: Shein Akamai Bot Manager HTTP 403 bypassed with playwright-stealth, randomized bezier curves, and residential proxies.
4. **SUVPlanet Auto Traders** (`prj-suvplanet`)
   - Client: SUVPlanet Kenya · Nairobi Showroom (15 Months Live)
   - Contract: KES 5,500 initial settled · KES 400 / 2 months listing ads (Total settled: KES 6,700)
   - Stack: React, Node.js Express, PostgreSQL, Cloudinary CDN (WebP 4K), WhatsApp pre-filled inquiry generator.
5. **Nokras Hotel & Resort Platform** (`prj-nokras-hotel`)
   - Client: Nokras Management Group · Murang’a & Embu
   - Contract: Non-paying · Flagship P3L portfolio engineering showcase
   - Stack: Next.js 14, Tailwind CSS, Supabase, Cloudinary 360° suite photo gallery, interactive conference quotation engine.
6. **Karani Law & BillsZip ERP** (`prj-karani-law`)
   - Client: Adv. Nyagah B. Kithinji · Upper Hill, Nairobi (Stage 4 UAT Pending)
   - Contract: Milestone Retainer Agreement (4 Stages)
   - Stack: Next.js 14, TypeScript, FastAPI, Supabase PostgreSQL, Docker, Azure ACR.
   - Statutory Math: Schedule 6 Advocates (Remuneration) Order (Cap 16 Sub. Leg.), getting-up fees 33.3%, drawing KES 75/folio, perusal KES 30/folio.
   - Key Incidents: FastAPI IPv6 ::1 collision locked to IPv4 127.0.0.1:8000.

### 2. P3L Internal & FinTech Projects (3)
7. **Inner Circle Hedge Fund Portal** (`prj-inner-circle`)
   - Client: Joseph Gitari · P3L Internal FinTech Prototype
   - Stack: React, TypeScript, Chart.js, Tailwind, Supabase PostgreSQL, client-side AES-256 data encryption.
   - Features: High-net-worth partner equity tracking, NAV calculator, FX hedging analytics (KES/USD/GBP), multi-signature withdrawal audit trail.
8. **Khaemba News & Media** (`prj-khaemba-news`)
   - Client: Dennis Khaemba · P3L Internal Publishing Platform
   - Stack: Next.js App Router, Sanity CMS headless API, Cloudflare Edge CDN.
   - Features: Multi-author investigative journalism engine, breaking news live ticker, low-bandwidth mobile reading mode with zero external fonts.
9. **OdinBot AI Assistant** (`prj-odinbot`)
   - Classification: Proprietary Legal & Systems LLM (3-Year Continuous Iteration)
   - Architecture: Hybrid Edge (8B LoRA on razak-server) + Cloud (70B MoE on Oracle Cloud VPS 45 TB NVMe).
   - Status: Active Incident — I&M Bank mirror HTTP 502 socket reset on tcp://10.14.2.80:8443 under automatic retry queue.

### 3. School Projects (4)
10. **KCA University: Network Forensics Packet Analyzer** (`prj-kca-forensics`)
    - Lead: Guyo Halake · Cyber Security & Forensics Lab Capstone
    - Stack: Python 3.11, Scapy, Wireshark libpcap, React, Tailwind CSS.
    - Features: Rogue DHCP server detection, ARP cache poisoning mitigation, promiscuous NIC detection, automated PCAP export.
11. **KCA University: Biometric QR Student Attendance** (`prj-kca-attendance`)
    - Lead: Guyo Halake · CS Department Innovation Prototype
    - Stack: React Native, Node.js, SQLite, HTML5 QR Scanner, Geolocation API.
    - Features: Anti-proxy lecture check-in with 15-second rotating TOTP QR codes and Haversine 50m GPS geofencing.
12. **Zetech University: Diploma Resource Repository** (`prj-zetech-repo`)
    - Lead: Guyo Halake · Open Student Resource Archive (400+ Students)
    - Stack: PHP 8.2, MySQL, Bootstrap 5, Cloudflare CDN, PDF.js.
    - Features: Indexed 6 years of diploma past papers and revision notes with fulltext search.
13. **MAT 1105 Discrete Math & Graph Visualizer** (`prj-discrete-math`)
    - Coursework Tool: Dijkstra shortest path, Kruskal MST, and topological sort DAG visualizer using HTML5 Canvas.

### 4. Personal Projects (3)
14. **Jellyfin Marsabit Media Streamer** (`prj-jellyfin-marsabit`)
    - Home Media: Offline local-network multimedia server on razak-server (4.2 TB storage, Intel QuickSync hardware transcoding).
15. **GTA IV & San Andreas CLEO Modding Engine** (`prj-gta-cleo`)
    - 3D Engineering Archive: Custom Kenyan matatu 14-seater physics, Land Cruiser V8 suspension tuning, CLEO script missions.
16. **Sovereign Telegram & WhatsApp Telemetry Bot** (`prj-sovereign-bot`)
    - 24/7 Watchdog: Python 3.11 systemd daemon alerting Guyo on Adrian AK fiber drop, CPU temperature >72°C, or battery bank failover.

### 5. Hardware Fleet (3 Systems)
17. **Marsabit Bare-Metal Server (razak-server)** (`prj-hw-razak-server`)
    - Ubuntu Server 24.04 LTS · Intel Core i7-10700 · 32GB DDR4 · 12 TB NAS (4x 4TB IronWolf RAID 5 + 1TB NVMe OS) · Adrian AK 3674 Fiber · Dual 100Ah Gel Batteries + APC 1500VA UPS · WireGuard Hub (`10.14.0.1/24`).
18. **Local HomeLab Linux Node** (`prj-hw-homelab-node`)
    - Arch Linux (Kernel 6.11) · AMD Ryzen 7 5700X · 32GB DDR4 · 2TB Samsung 980 Pro · WireGuard tunnel (`10.14.0.2` @ 12ms ping) · Daily driver compilation & USB peripheral testbed.
19. **Custom Built PC Workstation (Planning / Assembly)** (`prj-hw-custom-pc`)
    - Planned Sovereign AI Rig: AMD Ryzen 9 9950X, 64GB DDR5, Nvidia RTX 4080 Super 16GB, Dual 2TB NVMe RAID 0, 360mm Liquid Loop.

---

## 💻 6-TAB INLINE PROJECT DOSSIER ARCHITECTURE
When clicking any project card in AdminDashboard:
1. **Contract & Ledger (`overview`)**: Monthly retainer, initial setup paid, contract structure, M-Pesa transaction reference table, hardware outlays, client contact card with direct WhatsApp link.
2. **Architecture Journey (`journey`)**: Multi-month architectural shifts, field crashes, offline Electron migration, SQLite WAL <4ms, barcode laser integration, stealth web scrapers.
3. **Git Chronicles (`commits`)**: Repository names, branch tags, real commit hashes, and authentic commit messages.
4. **Client Comms (`comms`)**: Authentic Kenyan WhatsApp chat logs, phone requests, cashier feedback, and resolutions.
5. **Incidents & Fixes (`incidents`)**: Technical hardware/infrastructure incidents with Symptom, Root Cause Fix, and Permanent Configuration.
6. **Database & Specs (`data`)**: Real Supabase user management table (Karani Law), Hardware & Server technical specifications (Hardware Fleet), or partition storage mappings.
