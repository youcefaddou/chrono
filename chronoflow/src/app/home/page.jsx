import HeroSection from '../../components/Home/hero-section'
import FeaturesSection from '../../components/Home/features-section'
import HowItWorksSection from '../../components/Home/how-it-works-section'
import VisualPreviewSection from '../../components/Home/visual-preview-section'
import TestimonialsSection from '../../components/Home/testimonials-section'
import CTASection from '../../components/Home/cta-section'
import FAQSection from '../../components/Home/faq-section'

export default function HomePage () {
	return (
		<div>
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<VisualPreviewSection />
			<TestimonialsSection />
			<CTASection />
			<FAQSection />
		</div>
	)
}
