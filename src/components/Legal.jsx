import PropTypes from 'prop-types';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 mb-10">
    <h2 className="text-2xl font-bold text-brand mb-3">{title}</h2>
    <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
  </section>
);

Section.propTypes = { id: PropTypes.string, title: PropTypes.string, children: PropTypes.node };

const Legal = () => (
  <div className="max-w-3xl mx-auto px-6 py-12 text-left fade-up">
    <h1 className="text-4xl font-display mb-8">Terms &amp; Policies</h1>

    <Section id="terms" title="Terms of Service">
      <p>By using Reading Radical you agree to post only honest, respectful reviews and not to submit unlawful, hateful or spam content.</p>
      <p>We may remove reviews that break these rules. Reviews express the opinions of their authors, not of Reading Radical.</p>
    </Section>

    <Section id="privacy" title="Privacy Policy">
      <p>We store the name, email and (hashed) password you give us when registering, and the reviews and feedback you submit.</p>
      <p>We never sell your data. Passwords are hashed and cannot be read by us. Contact us to have your account removed.</p>
    </Section>

    <Section id="copyright" title="Copyrights">
      <p>Site design and original text are &copy; Reading Radical. Book titles, covers and descriptions belong to their respective authors and publishers and are shown for review purposes.</p>
    </Section>
  </div>
);

export default Legal;
