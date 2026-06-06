import Image from 'next/image';

const NAVBAR_LOGO_SRC = 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';

type Tone = 'yes' | 'warn' | 'no';

interface CellData {
    tone: Tone;
    text: string;
}

interface RowData {
    feature: string;
    dtps: CellData;
    brands: CellData;
    insta: CellData;
    diy: CellData;
}

const rows: RowData[] = [
    {
        feature: 'Personalized Plans',
        dtps: { tone: 'yes', text: 'Yes, based on your lifestyle' },
        brands: { tone: 'no', text: 'Generic charts' },
        insta: { tone: 'warn', text: 'One-time advice' },
        diy: { tone: 'no', text: 'Blog-based' },
    },
    {
        feature: 'Dual Coach Support',
        dtps: { tone: 'yes', text: 'Dietitian + Lifestyle Coach' },
        brands: { tone: 'no', text: 'Single contact' },
        insta: { tone: 'no', text: 'Limited access' },
        diy: { tone: 'no', text: 'None' },
    },
    {
        feature: 'Indian + Cheat Meals',
        dtps: { tone: 'yes', text: 'Roti, pizza, Maggi allowed' },
        brands: { tone: 'warn', text: 'Boiled food only' },
        insta: { tone: 'warn', text: 'Over-restrictive' },
        diy: { tone: 'no', text: 'Often non-Indian' },
    },
    {
        feature: 'No Gym Needed',
        dtps: { tone: 'yes', text: 'Walk-based' },
        brands: { tone: 'warn', text: 'Gym/supplement upsells' },
        insta: { tone: 'warn', text: 'May push pills' },
        diy: { tone: 'no', text: 'No structure' },
    },
    {
        feature: 'Real Results (2L+ Clients)',
        dtps: { tone: 'yes', text: 'Verified stories' },
        brands: { tone: 'warn', text: 'Limited proof' },
        insta: { tone: 'warn', text: 'Followers ≠ clients' },
        diy: { tone: 'no', text: 'No credibility' },
    },
    {
        feature: 'Expert-Backed',
        dtps: { tone: 'yes', text: 'Nutritionist + Medical team' },
        brands: { tone: 'warn', text: 'Influencer-endorsed' },
        insta: { tone: 'no', text: 'Unverified' },
        diy: { tone: 'no', text: 'No scientific base' },
    },
];

function Eyebrow() {
    return (
        <div className="mb-2 flex items-center gap-2">
            <span className="text-lg text-[#F5A623]">✦</span>
            <span className="text-sm font-semibold text-[#0D9488] md:text-base">What We Provide</span>
        </div>
    );
}

function StatusIcon({ tone }: { tone: Tone }) {
    if (tone === 'yes') {
        return (
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-[#22C55E] text-white shadow-[0_6px_12px_rgba(34,197,94,0.24)]">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                    <path d="M3 8.5L6.3 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
        );
    }

    if (tone === 'warn') {
        return (
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#111111]">
                <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                    <path d="M10 2.8L18 17H2L10 2.8Z" fill="currentColor" />
                    <path d="M10 7V11.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="10" cy="14.1" r="1" fill="white" />
                </svg>
            </span>
        );
    }

    return (
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#E11D1D]">
            <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        </span>
    );
}

function TableCell({ cell, className = '' }: { cell: CellData; className?: string }) {
    return (
        <div className={className}>
            <div className="flex items-start gap-2.5 text-[15px] leading-[1.15] text-[#1D1D1D] xl:text-[16px]">
                <StatusIcon tone={cell.tone} />
                <span>{cell.text}</span>
            </div>
        </div>
    );
}

function DtpsHeader() {
    return (
        <div className="flex min-h-[52px] items-center">
            <div className="relative h-10 w-[138px] shrink-0">
                <Image
                    src={NAVBAR_LOGO_SRC}
                    alt="Dietitian Poonam Sagar"
                    fill
                    sizes="138px"
                    className="object-contain object-left"
                />
            </div>
        </div>
    );
}

export default function ResponsiveWhyChooseDtpsTable() {
    return (
        <section className="rounded-[28px] bg-white py-2 md:py-4">
            <div className="site-fill">
                <Eyebrow />
                <h2
                    className="text-[2rem] font-bold leading-[1.03] text-[#1A1A1A] sm:text-[2.5rem] md:text-[3rem]"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                >
                    Why Choose DTPS
                </h2>

                <div className="mt-8 hidden overflow-hidden rounded-[24px] border border-[#D8D4CC] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)] lg:block">
                    <div className="grid grid-cols-[1.05fr_1.22fr_1fr_1fr_1fr]">
                        <div className="border-b border-r border-[#DEDAD2] px-5 py-8 text-[19px] font-medium text-[#171717]">
                            Feature
                        </div>
                        <div className="border-b border-r border-[#DEDAD2] bg-gradient-to-b from-[#119999] to-[#79CFCD] px-5 py-7">
                            <DtpsHeader />
                        </div>
                        <div className="border-b border-r border-[#DEDAD2] px-5 py-8 text-[19px] font-medium text-[#171717]">
                            Other Brands
                        </div>
                        <div className="border-b border-r border-[#DEDAD2] px-5 py-8 text-[19px] font-medium text-[#171717]">
                            Insta Dietitians
                        </div>
                        <div className="border-b border-[#DEDAD2] px-5 py-8 text-[19px] font-medium text-[#171717]">
                            DIY Diets
                        </div>
                    </div>

                    {rows.map((row, index) => {
                        const rowBorder = index === rows.length - 1 ? '' : 'border-b border-[#DEDAD2]';

                        return (
                            <div key={row.feature} className="grid grid-cols-[1.05fr_1.22fr_1fr_1fr_1fr]">
                                <div className={rowBorder + ' flex min-h-[98px] items-center border-r border-[#DEDAD2] px-5 py-6 text-[18px] font-medium leading-[1.08] text-[#171717] xl:text-[19px]'}>
                                    {row.feature}
                                </div>
                                <TableCell
                                    cell={row.dtps}
                                    className={rowBorder + ' flex min-h-[98px] items-center border-r border-[#DEDAD2] bg-gradient-to-b from-[#1BB1AE] via-[#74CFCE] to-[#B9E8E6] px-5 py-6'}
                                />
                                <TableCell cell={row.brands} className={rowBorder + ' flex min-h-[98px] items-center border-r border-[#DEDAD2] px-5 py-6'} />
                                <TableCell cell={row.insta} className={rowBorder + ' flex min-h-[98px] items-center border-r border-[#DEDAD2] px-5 py-6'} />
                                <TableCell cell={row.diy} className={rowBorder + ' flex min-h-[98px] items-center px-5 py-6'} />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 space-y-4 lg:hidden">
                    {rows.map((row) => (
                        <article
                            key={row.feature}
                            className="overflow-hidden rounded-[22px] border border-[#DEDAD2] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                        >
                            <div className="border-b border-[#E8E4DD] px-4 py-4">
                                <h3 className="text-[22px] font-semibold leading-[1.05] text-[#171717]">{row.feature}</h3>
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="rounded-[18px] bg-gradient-to-r from-[#119999] via-[#55C2C0] to-[#B2E5E4] p-4 text-white">
                                    <div className="mb-3">
                                        <DtpsHeader />
                                    </div>
                                    <TableCell cell={row.dtps} />
                                </div>

                                <div className="rounded-[18px] border border-[#E8E4DD] p-4">
                                    <div className="mb-2 text-sm font-semibold text-[#4B5563]">Other Brands</div>
                                    <TableCell cell={row.brands} />
                                </div>

                                <div className="rounded-[18px] border border-[#E8E4DD] p-4">
                                    <div className="mb-2 text-sm font-semibold text-[#4B5563]">Insta Dietitians</div>
                                    <TableCell cell={row.insta} />
                                </div>

                                <div className="rounded-[18px] border border-[#E8E4DD] p-4">
                                    <div className="mb-2 text-sm font-semibold text-[#4B5563]">DIY Diets</div>
                                    <TableCell cell={row.diy} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
