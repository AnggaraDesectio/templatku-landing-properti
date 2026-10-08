// Landing page GRIYA NUSA, agen properti.
// Halaman ini TIDAK memakai AuthenticatedLayout, header/nav + footer inline, self-contained.
// Tidak menerima props.
import { useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountdownTimer } from '@/components/countdown-timer';
import { StickyMobileCta } from '@/components/sticky-mobile-cta';
import { StatCounter } from '@/components/stat-counter';
import {
    ArrowRight,
    Bath,
    BedDouble,
    Building2,
    Calculator,
    CheckCircle2,
    Home,
    KeyRound,
    LandPlot,
    MapPin,
    Menu,
    Phone,
    Ruler,
    Search,
    ShieldCheck,
    Star,
    TrendingUp,
    X,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Format rupiah gaya Indonesia: 2450000000 -> "Rp2.450.000.000"
const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

// ---------- Data ----------

type StatusJual = 'dijual' | 'disewa';
type TipeProperti = 'Rumah' | 'Apartemen' | 'Ruko' | 'Tanah';

interface Listing {
    id: number;
    nama: string;
    lokasi: string;
    tipe: TipeProperti;
    status: StatusJual;
    harga: number;
    hargaLabel?: string; // mis. "/tahun" untuk sewa
    kt?: number; // kamar tidur
    km?: number; // kamar mandi
    lt?: number; // luas tanah m2
    lb?: number; // luas bangunan m2
    icon: LucideIcon;
    art: string;
    unggulan?: boolean;
}

const LISTINGS: Listing[] = [
    { id: 1, nama: 'Rumah Cluster Emerald Bintaro', lokasi: 'Bintaro', tipe: 'Rumah', status: 'dijual', harga: 2450000000, kt: 4, km: 3, lt: 180, lb: 220, icon: Home, art: 'from-emerald-600 via-teal-700 to-cyan-800', unggulan: true },
    { id: 2, nama: 'Rumah Asri Cibubur', lokasi: 'Cibubur', tipe: 'Rumah', status: 'dijual', harga: 1150000000, kt: 3, km: 2, lt: 120, lb: 110, icon: Home, art: 'from-amber-600 via-orange-700 to-red-700' },
    { id: 3, nama: 'Apartemen Taman Sidoarjo', lokasi: 'Sidoarjo', tipe: 'Apartemen', status: 'disewa', harga: 45000000, hargaLabel: '/tahun', kt: 2, km: 1, lb: 45, icon: Building2, art: 'from-sky-600 via-blue-700 to-indigo-800', unggulan: true },
    { id: 4, nama: 'Ruko 3 Lantai Bintaro Sektor 7', lokasi: 'Bintaro', tipe: 'Ruko', status: 'dijual', harga: 3800000000, km: 2, lt: 120, lb: 360, icon: Building2, art: 'from-violet-600 via-purple-700 to-indigo-800' },
    { id: 5, nama: 'Tanah Kavling Cibubur', lokasi: 'Cibubur', tipe: 'Tanah', status: 'dijual', harga: 975000000, lt: 300, icon: LandPlot, art: 'from-lime-600 via-green-700 to-emerald-800' },
    { id: 6, nama: 'Rumah Hook Sidoarjo Kota', lokasi: 'Sidoarjo', tipe: 'Rumah', status: 'disewa', harga: 60000000, hargaLabel: '/tahun', kt: 3, km: 2, lt: 150, lb: 130, icon: Home, art: 'from-rose-500 via-pink-600 to-rose-700' },
    { id: 7, nama: 'Rumah Baru Grand Cibubur', lokasi: 'Cibubur', tipe: 'Rumah', status: 'dijual', harga: 1890000000, kt: 4, km: 3, lt: 150, lb: 180, icon: Home, art: 'from-orange-500 via-amber-600 to-yellow-700' },
    { id: 8, nama: 'Ruko Pinggir Jalan Sidoarjo', lokasi: 'Sidoarjo', tipe: 'Ruko', status: 'disewa', harga: 85000000, hargaLabel: '/tahun', km: 1, lt: 100, lb: 200, icon: Building2, art: 'from-slate-600 via-slate-700 to-slate-900' },
];

const LOKASI_FILTER = ['Semua Lokasi', 'Bintaro', 'Cibubur', 'Sidoarjo'];
const TIPE_FILTER = ['Semua Tipe', 'Rumah', 'Apartemen', 'Ruko', 'Tanah'];
const BUDGET_FILTER = [
    { value: 'semua', label: 'Semua Budget' },
    { value: 'lt1', label: 'Di bawah Rp1 M' },
    { value: '1-2', label: 'Rp1, 2 M' },
    { value: 'gt2', label: 'Di atas Rp2 M' },
];

function cocokBudget(harga: number, budget: string) {
    if (budget === 'lt1') return harga < 1_000_000_000;
    if (budget === '1-2') return harga >= 1_000_000_000 && harga <= 2_000_000_000;
    if (budget === 'gt2') return harga > 2_000_000_000;
    return true;
}

const KAWASAN = [
    { nama: 'Bintaro, Tangerang Selatan', deskripsi: 'Kawasan matang dengan akses tol & KRL. Favorit keluarga muda.', hargaMulai: 1100000000, tren: '+8,2%/thn', foto: '/images/landing-properti/kawasan-bintaro.jpg' },
    { nama: 'Cibubur, Jakarta Timur', deskripsi: 'Dekat tol Jagorawi & LRT. Harga masih bersahabat.', hargaMulai: 850000000, tren: '+6,5%/thn', foto: '/images/landing-properti/kawasan-cibubur.jpg' },
    { nama: 'Sidoarjo, Jawa Timur', deskripsi: 'Penyangga Surabaya, kawasan industri & hunian berkembang.', hargaMulai: 650000000, tren: '+5,1%/thn', foto: '/images/landing-properti/kawasan-sidoarjo.jpg' },
];

// Foto listing per tipe properti, foto lokal di public/images/landing-properti/
const FOTO_TIPE: Record<TipeProperti, string> = {
    Rumah: '/images/landing-properti/listing-rumah.jpg',
    Apartemen: '/images/landing-properti/listing-apartemen.jpg',
    Ruko: '/images/landing-properti/listing-ruko.jpg',
    Tanah: '/images/landing-properti/listing-tanah.jpg',
};

const AGEN = [
    { nama: 'Rina Kartika', peran: 'Senior Property Consultant', area: 'Bintaro & sekitarnya', hp: '0812-1111-2233', inisial: 'RK', art: 'from-emerald-600 to-teal-800', terjual: 87 },
    { nama: 'Bambang Sutrisno', peran: 'Property Consultant', area: 'Cibubur & Jakarta Timur', hp: '0812-4444-5566', inisial: 'BS', art: 'from-sky-600 to-blue-800', terjual: 64 },
    { nama: 'Dewi Anggraini', peran: 'Leasing Specialist', area: 'Sidoarjo & Surabaya', hp: '0812-7777-8899', inisial: 'DA', art: 'from-violet-600 to-purple-800', terjual: 52 },
];

// Harga pasar per m2 (bangunan) untuk estimasi valuasi, angka ilustratif per kawasan.
const HARGA_PER_M2: Record<string, number> = { Bintaro: 22000000, Cibubur: 12000000, Sidoarjo: 8000000 };

// ---------- Komponen kecil ----------

// Foto properti asli per tipe, menggantikan CSS-art.
function FotoProperti({ listing, className }: { listing: Listing; className?: string }) {
    return (
        <div className={cn('relative h-44 overflow-hidden', className)}>
            <img
                src={FOTO_TIPE[listing.tipe]}
                alt={listing.nama}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <Badge className={cn('absolute top-2.5 left-2.5', listing.status === 'dijual' ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-600')}>
                {listing.status === 'dijual' ? 'Dijual' : 'Disewa'}
            </Badge>
            {listing.unggulan && <Badge className="absolute top-2.5 right-2.5 bg-amber-400 text-amber-950 hover:bg-amber-400"><Star className="mr-1 h-3 w-3 fill-amber-950" />Unggulan</Badge>}
        </div>
    );
}

function KartuListing({ listing }: { listing: Listing }) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <FotoProperti listing={listing} />
            <CardContent className="p-4">
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{listing.lokasi}</p>
                <p className="mt-1 line-clamp-1 font-semibold">{listing.nama}</p>
                <p className="mt-1.5 text-lg font-extrabold text-emerald-700">
                    {rupiah(listing.harga)}{listing.hargaLabel && <span className="text-sm font-normal text-muted-foreground">{listing.hargaLabel}</span>}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
                    {listing.kt !== undefined && <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{listing.kt} KT</span>}
                    {listing.km !== undefined && <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{listing.km} KM</span>}
                    {listing.lt !== undefined && <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />LT {listing.lt} m²</span>}
                    {listing.lb !== undefined && <span className="flex items-center gap-1"><LandPlot className="h-4 w-4" />LB {listing.lb} m²</span>}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                    Lihat Detail <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}

// ---------- Halaman ----------

export default function PropertiLanding() {
    const [menuBuka, setMenuBuka] = useState(false);

    // Filter pencarian properti (client-side).
    const [lokasi, setLokasi] = useState('Semua Lokasi');
    const [tipe, setTipe] = useState('Semua Tipe');
    const [budget, setBudget] = useState('semua');
    const [status, setStatus] = useState<'semua' | StatusJual>('semua');

    const hasilFilter = useMemo(() => LISTINGS.filter((l) =>
        (lokasi === 'Semua Lokasi' || l.lokasi === lokasi) &&
        (tipe === 'Semua Tipe' || l.tipe === tipe) &&
        (status === 'semua' || l.status === status) &&
        cocokBudget(l.harga, budget),
    ), [lokasi, tipe, budget, status]);

    // Form valuasi, hasil estimasi ilustratif, tanpa backend.
    const [valLokasi, setValLokasi] = useState('Bintaro');
    const [valLT, setValLT] = useState('120');
    const [valLB, setValLB] = useState('90');
    const [valHasil, setValHasil] = useState<number | null>(null);

    function hitungValuasi(e: FormEvent) {
        e.preventDefault();
        const lt = Math.max(0, parseFloat(valLT) || 0);
        const lb = Math.max(0, parseFloat(valLB) || 0);
        if (lt === 0 && lb === 0) return;
        const perM2 = HARGA_PER_M2[valLokasi] ?? 10000000;
        // Bobot: tanah 55%, bangunan 45%.
        const estimasi = Math.round((lt * 0.55 + lb * 0.45) * perM2);
        setValHasil(estimasi);
    }

    // Countdown dipakai untuk banner promo konsultasi.
    const targetPromo = useMemo(() => new Date(Date.now() + 2 * 24 * 3600 * 1000 + 5 * 3600 * 1000), []);

    const navLinks = [
        { href: '#cari', label: 'Cari Properti' },
        { href: '#kawasan', label: 'Kawasan' },
        { href: '#valuasi', label: 'Cek Harga' },
        { href: '#agen', label: 'Agen Kami' },
    ];

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-0">
            {/* Navbar */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
                    <a href="#beranda" className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800">
                            <KeyRound className="h-5 w-5 text-white" />
                        </span>
                        <span className="text-xl font-extrabold tracking-tight">
                            GRIYA<span className="text-emerald-700">NUSA</span>
                        </span>
                    </a>
                    <nav className="ml-6 hidden items-center gap-1 md:flex">
                        {navLinks.map((l) => (
                            <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                {l.label}
                            </a>
                        ))}
                    </nav>
                    <Button className="ml-auto hidden bg-emerald-700 hover:bg-emerald-800 sm:inline-flex" asChild>
                        <a href="#valuasi">Cek Harga Rumah</a>
                    </Button>
                    <Button variant="ghost" size="icon" className="ml-auto sm:hidden" onClick={() => setMenuBuka((v) => !v)} aria-label="Menu">
                        {menuBuka ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
                {menuBuka && (
                    <nav className="border-t px-4 py-2 md:hidden">
                        {navLinks.map((l) => (
                            <a key={l.href} href={l.href} onClick={() => setMenuBuka(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                                {l.label}
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            {/* Hero full-bleed + search bar */}
            <section id="beranda" className="relative overflow-hidden text-white">
                <img
                    src="/images/landing-properti/hero.jpg"
                    alt="Rumah modern di kawasan hunian"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-emerald-950/40 to-slate-950/60" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-40 sm:pt-24 sm:pb-48">
                    <div className="max-w-2xl">
                        <Badge className="mb-4 bg-white/15 text-white hover:bg-white/15">Agen Properti Terpercaya • Sejak 2014</Badge>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Temukan Rumah Impianmu di Nusantara
                        </h1>
                        <p className="mt-4 max-w-lg text-emerald-100/90">
                            250+ properti terjual, pendampingan KPR sampai AJB, dan agen berlisensi
                            yang benar-benar paham kawasan.
                        </p>
                    </div>
                </div>

                {/* Search bar properti, overlap ke section listing */}
                <div id="cari" className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4">
                    <Card className="mx-auto max-w-5xl shadow-2xl">
                        <CardContent className="p-4 sm:p-5">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                                <div className="space-y-1.5">
                                    <Label>Lokasi</Label>
                                    <Select value={lokasi} onValueChange={setLokasi}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {LOKASI_FILTER.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Tipe properti</Label>
                                    <Select value={tipe} onValueChange={setTipe}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {TIPE_FILTER.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Budget</Label>
                                    <Select value={budget} onValueChange={setBudget}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {BUDGET_FILTER.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full bg-emerald-700 hover:bg-emerald-800 lg:w-auto" onClick={() => document.getElementById('hasil-cari')?.scrollIntoView({ behavior: 'smooth' })}>
                                        <Search className="mr-2 h-4 w-4" /> Cari
                                    </Button>
                                </div>
                            </div>
                            {/* Toggle status Dijual / Disewa */}
                            <div className="mt-3 flex gap-2">
                                {(['semua', 'dijual', 'disewa'] as const).map((s) => (
                                    <Button key={s} size="sm" variant={status === s ? 'default' : 'outline'} className={status === s ? 'bg-emerald-700 hover:bg-emerald-800' : ''} onClick={() => setStatus(s)}>
                                        {s === 'semua' ? 'Semua' : s === 'dijual' ? 'Dijual' : 'Disewa'}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Hasil listing (difilter client-side) */}
            <section id="hasil-cari" className="mx-auto max-w-7xl px-4 pt-28 sm:pt-32">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold sm:text-2xl">
                        Properti Pilihan <span className="text-sm font-normal text-muted-foreground">({hasilFilter.length} hasil)</span>
                    </h2>
                    {(lokasi !== 'Semua Lokasi' || tipe !== 'Semua Tipe' || budget !== 'semua' || status !== 'semua') && (
                        <Button variant="ghost" size="sm" onClick={() => { setLokasi('Semua Lokasi'); setTipe('Semua Tipe'); setBudget('semua'); setStatus('semua'); }}>
                            Reset filter
                        </Button>
                    )}
                </div>
                {hasilFilter.length === 0 ? (
                    <Card className="mt-6">
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <Home className="mx-auto h-10 w-10 opacity-40" />
                            <p className="mt-3 font-medium">Tidak ada properti yang cocok.</p>
                            <p className="text-sm">Coba longgarkan filter lokasi, tipe, atau budget.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {hasilFilter.map((l) => <KartuListing key={l.id} listing={l} />)}
                    </div>
                )}
            </section>

            {/* Banner promo konsultasi + countdown */}
            <section className="mx-auto max-w-7xl px-4 pt-12">
                <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                        <div className="flex-1">
                            <p className="font-bold text-amber-900">Promo: Konsultasi KPR gratis + cashback Rp5 juta</p>
                            <p className="text-sm text-amber-800/80">Untuk 10 pendaftar pertama bulan ini. Penawaran berakhir dalam:</p>
                        </div>
                        <CountdownTimer target={targetPromo} />
                        <Button className="bg-amber-600 hover:bg-amber-700">Ambil Promo</Button>
                    </CardContent>
                </Card>
            </section>

            {/* Siapa yang kami layani */}
            <section className="mx-auto max-w-7xl px-4 pt-14">
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Mau Beli, Investasi, atau Sewa?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                        { icon: Home, judul: 'Pembeli pertama', teks: 'Simulasi KPR + konsultasi gratis. Kami dampingi sampai AJB, bukan cuma sampai DP.' },
                        { icon: TrendingUp, judul: 'Investor', teks: 'Data tren harga per kawasan (Bintaro +8,2%/thn). Cari yang yield sewanya masuk akal.' },
                        { icon: KeyRound, judul: 'Penyewa', teks: 'Kontrak jelas, tanpa calo. Apartemen & ruko disewa langsung dari pemilik terverifikasi.' },
                    ].map((p) => (
                        <div key={p.judul} className="flex gap-3 rounded-2xl border bg-card p-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700/10">
                                <p.icon className="h-5 w-5 text-emerald-700" />
                            </span>
                            <div>
                                <p className="font-bold">{p.judul}</p>
                                <p className="mt-0.5 text-sm text-muted-foreground">{p.teks}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Kawasan */}
            <section id="kawasan" className="mx-auto max-w-7xl px-4 py-14">
                <h2 className="text-center text-3xl font-extrabold tracking-tight">Jelajahi Kawasan</h2>
                <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">Tiga kawasan dengan pertumbuhan harga terbaik versi riset tim kami.</p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {KAWASAN.map((k) => (
                        <Card key={k.nama} className="overflow-hidden transition-shadow hover:shadow-md">
                            <div className="relative h-36 overflow-hidden">
                                <img
                                    src={k.foto}
                                    alt={k.nama}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <Badge className="absolute top-2.5 right-2.5 bg-white/90 text-emerald-800 hover:bg-white/90">
                                    <TrendingUp className="mr-1 h-3 w-3" />{k.tren}
                                </Badge>
                            </div>
                            <CardContent className="p-5">
                                <p className="font-semibold">{k.nama}</p>
                                <p className="mt-1.5 text-sm text-muted-foreground">{k.deskripsi}</p>
                                <p className="mt-3 text-sm">Mulai dari <span className="font-bold text-emerald-700">{rupiah(k.hargaMulai)}</span></p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Statistik */}
            <section className="bg-emerald-950 py-14 text-white">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center lg:grid-cols-4">
                    {[
                        { value: 250, suffix: '+', label: 'Properti terjual' },
                        { value: 12, suffix: '', label: 'Tahun pengalaman' },
                        { value: 98, suffix: '%', label: 'Klien puas' },
                        { value: 40, suffix: '+', label: 'Agen berlisensi' },
                    ].map((s) => (
                        <div key={s.label}>
                            <StatCounter value={s.value} suffix={s.suffix} className="text-4xl font-extrabold text-emerald-300 sm:text-5xl" />
                            <p className="mt-2 text-sm text-emerald-100/80">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Valuasi */}
            <section id="valuasi" className="mx-auto max-w-6xl px-4 py-14">
                <div className="grid items-start gap-8 lg:grid-cols-2">
                    <div>
                        <Badge variant="outline" className="border-emerald-700/30 text-emerald-700">Valuasi Gratis</Badge>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Cek Estimasi Harga Rumahmu</h2>
                        <p className="mt-2 text-muted-foreground">
                            Masukkan luas tanah, luas bangunan, dan lokasinya, dapatkan estimasi
                            harga pasar dalam hitungan detik. Gratis, tanpa perlu daftar.
                        </p>
                        <ul className="mt-5 space-y-2.5 text-sm">
                            {['Berdasarkan data transaksi 12 bulan terakhir', 'Akurasi ±8% untuk kawasan yang kami layani', 'Estimasi detail dikirim via WhatsApp bila kamu mau'].map((x) => (
                                <li key={x} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{x}</li>
                            ))}
                        </ul>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-emerald-700" /> Kalkulator Valuasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {valHasil !== null ? (
                                <div className="rounded-xl bg-emerald-50 p-6 text-center">
                                    <p className="text-sm text-emerald-800">Estimasi harga pasar propertimu</p>
                                    <p className="mt-2 text-3xl font-extrabold text-emerald-700">{rupiah(valHasil)}</p>
                                    <p className="mt-1 text-xs text-emerald-700/80">Rentang wajar: {rupiah(Math.round(valHasil * 0.92))}, {rupiah(Math.round(valHasil * 1.08))}</p>
                                    <p className="mt-3 text-xs text-muted-foreground">Estimasi ilustratif berdasarkan harga pasar kawasan {valLokasi}. Untuk appraisal resmi, hubungi agen kami.</p>
                                    <div className="mt-4 flex gap-2">
                                        <Button className="flex-1 bg-emerald-700 hover:bg-emerald-800">Minta Appraisal Detail</Button>
                                        <Button variant="outline" onClick={() => setValHasil(null)}>Hitung ulang</Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={hitungValuasi} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="val-lokasi">Lokasi properti</Label>
                                        <Select value={valLokasi} onValueChange={setValLokasi}>
                                            <SelectTrigger id="val-lokasi"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(HARGA_PER_M2).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="val-lt">Luas tanah (m²)</Label>
                                            <Input id="val-lt" type="number" min={0} value={valLT} onChange={(e) => setValLT(e.target.value)} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="val-lb">Luas bangunan (m²)</Label>
                                            <Input id="val-lb" type="number" min={0} value={valLB} onChange={(e) => setValLB(e.target.value)} required />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800">Hitung Estimasi</Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Agen */}
            <section id="agen" className="bg-muted/50 py-14">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-center text-3xl font-extrabold tracking-tight">Kenali Agen Kami</h2>
                    <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">Berlisensi AREBI, mengenal kawasan luar-dalam, dan siap mendampingi sampai AJB.</p>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {AGEN.map((a) => (
                            <Card key={a.nama}>
                                <CardContent className="p-6 text-center">
                                    <span className={cn('mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white', a.art)}>
                                        {a.inisial}
                                    </span>
                                    <p className="mt-4 flex items-center justify-center gap-1.5 font-semibold">
                                        {a.nama} <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    </p>
                                    <p className="text-sm text-emerald-700">{a.peran}</p>
                                    <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{a.area}</p>
                                    <Badge variant="secondary" className="mt-3">{a.terjual} properti terjual</Badge>
                                    <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                                        <a href={`https://wa.me/62${a.hp.replace(/\D/g, '').slice(1)}?text=Halo%20${encodeURIComponent(a.nama)}%2C%20saya%20tertarik%20konsultasi%20properti.`} target="_blank" rel="noreferrer">
                                            <Phone className="mr-1.5 h-4 w-4" /> {a.hp}
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-300">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800">
                                <KeyRound className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-lg font-extrabold text-white">GRIYA<span className="text-emerald-500">NUSA</span></span>
                        </div>
                        <p className="mt-3 text-sm text-slate-400">Agen properti terpercaya sejak 2014. Membantu 2.800+ keluarga menemukan hunian impian.</p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-400"><Phone className="h-4 w-4" /> 1500-123 (Senin–Sabtu)</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Layanan</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-400">
                            {['Jual Beli Properti', 'Sewa Properti', 'Konsultasi KPR', 'Valuasi & Appraisal', 'Urus AJB & Balik Nama'].map((x) => (
                                <li key={x}><a href="#cari" className="hover:text-white">{x}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Kantor Pusat</p>
                        <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                            <li>Jl. Pahlawan Revolusi No. 12</li>
                            <li>Bintaro, Tangerang Selatan 15221</li>
                            <li className="pt-1">Izin usaha: SIUJK No. 9120102345678</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">© 2026 Griya Nusa. Rumah impian, kami wujudkan.</div>
            </footer>

            {/* CTA sticky mobile: telepon agen */}
            <StickyMobileCta
                variant="call"
                title="Hubungi Agen"
                subtitle="Konsultasi gratis • respon < 5 menit"
                actionLabel="Telepon Sekarang"
            />
        </div>
    );
}
