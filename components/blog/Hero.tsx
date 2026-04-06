"use client";
import PageWrapper from '../PageWrapper';

export default function BlogHero() {
    return (
        <section className="hero-section pt-4 md:pt-[60px] px-3 md:px-[60px] lg:px-[120px] rounded-3xl overflow-hidden">
            <PageWrapper>
                {/* Hero Section */}
                <section className="page-header">
                    <div className="container">
                        <h1 className="section-title light">Blog</h1>
                        <div className="breadcrumb light">
                            <span>Home</span> / <span>Blog</span>
                        </div>
                    </div>
                </section>
            </PageWrapper>
        </section>)
}
