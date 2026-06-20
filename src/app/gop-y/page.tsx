import { MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white px-4 py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/60 dark:shadow-none">
              <MessageSquareHeart className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">Phản hồi</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Góp ý cho CHẠM</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Mọi góp ý của bạn sẽ giúp tụi mình cải thiện trải nghiệm học ngôn ngữ ký hiệu tốt hơn.
              </p>
            </div>
          </div>

          <FeedbackForm />
        </section>
      </div>
    </main>
  );
}
