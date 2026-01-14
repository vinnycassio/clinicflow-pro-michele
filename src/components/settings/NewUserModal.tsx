import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppRole, ROLE_LABELS } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface Professional {
  professional_id: string;
  full_name: string;
  user_id: string | null;
}

interface NewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: Professional[];
  onUserCreated: () => void;
}

const formSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72),
  full_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  role: z.enum(["admin", "professional", "receptionist"]),
  professional_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const NewUserModal = ({
  open,
  onOpenChange,
  professionals,
  onUserCreated,
}: NewUserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "receptionist",
      professional_id: "",
    },
  });

  const selectedRole = form.watch("role");

  // Available professionals (not linked to other users)
  const availableProfessionals = professionals.filter((p) => !p.user_id);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      const userId = authData.user.id;

      // Wait a moment for triggers to run
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: data.role })
        .eq("user_id", userId);

      if (roleError) {
        // If update fails, try insert
        await supabase.from("user_roles").insert({
          user_id: userId,
          role: data.role,
        });
      }

      // Link to professional if selected
      if (data.professional_id && data.role === "professional") {
        await supabase
          .from("vl_clinic_core_professionals")
          .update({ user_id: userId })
          .eq("professional_id", data.professional_id);
      }

      toast({
        title: "Usuário criado",
        description: `Usuário ${data.full_name} criado com sucesso!`,
      });

      form.reset();
      onOpenChange(false);
      onUserCreated();
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      let errorMessage = "Erro ao criar usuário";
      if (error.message?.includes("already registered")) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário para acessar o sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="joao@clinica.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        {ROLE_LABELS.admin}
                      </SelectItem>
                      <SelectItem value="professional">
                        {ROLE_LABELS.professional}
                      </SelectItem>
                      <SelectItem value="receptionist">
                        {ROLE_LABELS.receptionist}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === "professional" && availableProfessionals.length > 0 && (
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vincular a Profissional (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {availableProfessionals.map((prof) => (
                          <SelectItem
                            key={prof.professional_id}
                            value={prof.professional_id}
                          >
                            {prof.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
