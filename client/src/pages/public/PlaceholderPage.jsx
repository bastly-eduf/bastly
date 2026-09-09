import Seo from '../../components/seo/Seo';

export default function PlaceholderPage({ title, noIndex = false }) {
  return (
    <>
      <Seo
        title={`${title} | Bastly Academy`}
        description={`${title} at Bastly Academy.`}
        noIndex={noIndex}
      />

      <main className="placeholder-page">
        <div className="container">
          <p className="eyebrow">Bastly Academy</p>
          <h1>{title}</h1>
          <p>This route is reserved and will be built in its dedicated project step.</p>
        </div>
      </main>
    </>
  );
}
