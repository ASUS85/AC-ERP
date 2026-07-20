import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Topbar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Topbar"!</div>
}
