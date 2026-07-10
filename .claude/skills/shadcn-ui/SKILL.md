---
name: shadcn-ui
description: "shadcn/ui — copy-in React component system built on Radix UI + Tailwind CSS. CLI usage (npx shadcn@latest init/add), components.json config, theming with CSS variables (oklch), dark mode, customizing owned components, forms with react-hook-form + zod, composition patterns. Use when building React/Next.js UI: buttons, dialogs, dropdowns, forms, tables, cards, navigation, sidebars, toasts. Triggers: shadcn, radix, cn utility, components/ui, Tailwind component library, design system components."
license: MIT (shadcn/ui)
metadata:
  source: https://github.com/shadcn-ui/ui
  version-basis: "shadcn CLI 3.x, Tailwind CSS v4 era, React 19"
---

# shadcn/ui

Not an npm component library — the CLI **copies component source into your repo** (`components/ui/`), and you own and edit it. Built on Radix UI primitives (accessibility/behavior) + Tailwind (styling) + CVA (variants).

## Setup & adding components

```bash
npx shadcn@latest init          # creates components.json, css variables, lib/utils
npx shadcn@latest add button card dialog dropdown-menu form input sonner
```

- Package is `shadcn` (the old `shadcn-ui` package is deprecated).
- `components.json` records style, paths, and CSS variable mode — don't hand-edit component paths after the fact without updating it.
- Works with Next.js (App Router), Vite, Remix, Astro, etc. Supports Tailwind v4 (CSS-first `@theme` config) and v3.
- The CLI can also install from **registries/remote URLs** (`npx shadcn@latest add https://.../component.json`) — third-party shadcn-compatible components install the same way.

## Core conventions

- `cn()` from `lib/utils` merges Tailwind classes (`clsx` + `tailwind-merge`): always use it when combining conditional classes with defaults.
- Variants via CVA:

```tsx
const buttonVariants = cva('inline-flex items-center ...', {
  variants: {
    variant: { default: '...', destructive: '...', outline: '...', ghost: '...', link: '...' },
    size: { default: 'h-9 px-4', sm: 'h-8 px-3', lg: 'h-10 px-6', icon: 'size-9' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

- Composition over configuration: components expose subparts (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) you compose in JSX rather than a prop soup.
- `asChild` (Radix Slot) renders your element with the component's behavior/styles: `<Button asChild><Link href="/docs">Docs</Link></Button>`.

## Theming

Semantic CSS variables in `globals.css`, referenced by Tailwind utilities (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`, plus `card`, `popover`, `secondary`, `accent`, `destructive`, `chart-1..5`, `sidebar-*`). New projects use **oklch** color values.

```css
:root { --background: oklch(1 0 0); --primary: oklch(0.55 0.22 293); --radius: 0.625rem; }
.dark { --background: oklch(0.145 0 0); ... }
```

- Re-theme the whole app by editing variables — don't hardcode palette colors inside components.
- Dark mode: `.dark` class on `<html>`; in Next.js use the `next-themes` package with `attribute="class"`.
- Radius flows from `--radius` (`rounded-lg` in components maps to it).

## Forms (the standard stack)

`react-hook-form` + `zod` + shadcn `Form` wrappers:

```tsx
const schema = z.object({ email: z.string().email() });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## Component quick notes

- **Dialog vs Sheet vs Drawer vs AlertDialog**: modal / side panel / mobile bottom sheet (vaul) / confirm-destructive.
- **Toasts**: use `sonner` (`<Toaster />` + `toast('...')`) — the old `toast` component is deprecated.
- **Data tables**: `Table` primitives + TanStack Table for sorting/filtering/pagination (documented pattern).
- **Select vs Combobox**: Combobox = `Popover` + `Command` composition (searchable).
- **Sidebar**: full `Sidebar` primitive set (`SidebarProvider`, collapsible, mobile-aware) for dashboards/app shells.
- **Skeleton** for loading states; **Command** (`cmdk`) for ⌘K palettes.
- Icons: `lucide-react` by default.

## Customizing (you own the code)

Edit files in `components/ui/` directly — change variants, add sizes, restyle. Re-running `add` for an existing component prompts to overwrite; diff before accepting if you've customized. Keep customizations in the CVA variant maps where possible so call sites stay clean.

## With 3D/animation projects (this repo)

- shadcn handles the 2D UI shell (nav, cards, dialogs, controls) *around* the R3F canvas; put the canvas in a layout slot, not inside Radix portals.
- Overlaying UI on a full-screen canvas: absolutely-position shadcn components above `<Canvas>` with `pointer-events-none` on the wrapper and `pointer-events-auto` on interactive children, so orbit controls still receive drag events.
- Motion/GSAP animate shadcn components fine — they're plain DOM. For Radix exit animations use `AnimatePresence` with controlled `open` + `forceMount`.

## Common pitfalls

- Radix portals render outside your styled tree — theme variables must be on `:root`/`html`, not a nested wrapper.
- `Dialog` inside `DropdownMenu` closes instantly: lift Dialog outside and control with state, trigger via `onSelect={(e) => e.preventDefault()}`.
- Tailwind v4: no `tailwind.config.js` scanning issues, but ensure `@source` covers `components/ui` if code lives outside defaults.
- Server components: most shadcn components are client components already (`"use client"` in the file) — importing into RSC pages is fine.
- Hydration mismatch with theme: add `suppressHydrationWarning` on `<html>` when using next-themes.
