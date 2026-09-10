import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      'Bastly render error:',
      error,
      info,
    );
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8fc] px-4 py-10">
        <div className="w-full max-w-[560px] rounded-[30px] border border-line bg-white p-6 text-center shadow-card sm:p-8">
          <span className="mx-auto mb-5 grid size-16 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft">
            <img
              src="/brand/bastly-logo.webp"
              alt="Bastly Academy"
              className="size-full object-contain"
            />
          </span>

          <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            Something went wrong
          </p>

          <h1 className="mb-3 font-heading text-3xl font-bold tracking-[-0.05em] text-bastly-navy">
            Bastly couldn't open this screen.
          </h1>

          <p className="mx-auto mb-6 max-w-[430px] text-sm leading-7 text-muted">
            Your account data was not deleted. Reload this screen
            first; if the problem continues, return to the Bastly
            homepage and try again.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
            >
              Reload
            </button>

            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 text-sm font-extrabold text-bastly-navy no-underline"
            >
              Bastly home
            </a>
          </div>
        </div>
      </main>
    );
  }
}
