import { ChildProfileForm } from "@/components/onboarding/ChildProfileForm";

export default function OnboardingPage() {
  return (
    <div className="px-4 pt-24 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-rust">Velkommen</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Opret barnets profil</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
          Barnets profil binder journal, udflugter og kommende Aula-glimt sammen.
        </p>
        <div className="mt-6">
          <ChildProfileForm />
        </div>
      </div>
    </div>
  );
}
