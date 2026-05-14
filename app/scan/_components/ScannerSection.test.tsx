import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ScannerSection from "./ScannerSection";
import { LanguageProvider } from "@/lib/language-context";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderScanner() {
  return render(
    <LanguageProvider>
      <ScannerSection />
    </LanguageProvider>,
  );
}

describe("ScannerSection — rate-limit (429) handling", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the API error message when /api/scan returns 429", async () => {
    const apiMessage = "För många scanningar. Vänta en minut.";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: apiMessage }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    renderScanner();

    const input = screen.getByLabelText(/domännamn|domain/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "bahnhof.se" } });

    const scanBtn = screen.getByRole("button", { name: /scanna|scan/i });
    await act(async () => {
      fireEvent.click(scanBtn);
    });

    // Pipeline enforces a 3.5s minimum before transitioning out of "scanning".
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(screen.getByText(apiMessage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /prova en annan|try another/i })).toBeInTheDocument();
  });

  it("clicking the retry button returns to the idle scanner UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "rate limited" }), { status: 429 }),
      ),
    );

    renderScanner();

    fireEvent.change(screen.getByLabelText(/domännamn|domain/i), {
      target: { value: "bahnhof.se" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /scanna|scan/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    const retry = screen.getByRole("button", { name: /prova en annan|try another/i });
    await act(async () => {
      fireEvent.click(retry);
    });

    // Idle state shows the scanner input again.
    expect(screen.getByLabelText(/domännamn|domain/i)).toBeInTheDocument();
  });
});
