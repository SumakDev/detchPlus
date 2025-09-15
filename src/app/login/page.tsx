import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Sistema de Ventas</h1>
          <form className="space-y-4">
            <div>
              <Label htmlFor="usuario">Usuario</Label>
              <Input id="usuario" placeholder="Ingresa tu usuario" />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full">Ingresar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}   

