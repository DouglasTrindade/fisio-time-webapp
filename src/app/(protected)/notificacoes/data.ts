import type { AppNotification } from "@/app/types/notification";

const now = new Date();

const subtractMinutes = (minutes: number) => {
  const date = new Date(now);
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
};

export const notificationsData: AppNotification[] = [
  {
    id: "ntf-1",
    title: "Novo ticket atribuído",
    message: "Você foi atribuído ao ticket #1234 - Redesign do site.",
    status: "unread",
    category: "ticket",
    channel: "Ticket",
    priority: "high",
    timestamp: subtractMinutes(5),
    highlight: true,
  },
  {
    id: "ntf-2",
    title: "Solicitação de acesso",
    message: "Joaquina Weisenborn solicitou acesso ao projeto Website Redesign.",
    status: "unread",
    category: "team",
    channel: "Equipe",
    timestamp: subtractMinutes(45),
    actor: {
      name: "Joaquina Weisenborn",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&auto=format",
      role: "Product Designer",
    },
    actions: [
      { id: "accept", label: "Aceitar" },
      { id: "decline", label: "Recusar", variant: "destructive" },
    ],
  },
  {
    id: "ntf-3",
    title: "Nova mensagem",
    message: "Sarah Johnson enviou uma mensagem no ticket #1230.",
    status: "unread",
    category: "message",
    channel: "Mensagem",
    timestamp: subtractMinutes(60),
  },
  {
    id: "ntf-4",
    title: "Atualização da equipe",
    message: "Novo membro João Silva entrou no projeto de rebranding.",
    status: "read",
    category: "team",
    channel: "Equipe",
    timestamp: subtractMinutes(120),
  },
  {
    id: "ntf-5",
    title: "Ticket concluído",
    message: "Ticket #1235 - Ajustes de acessibilidade foi marcado como concluído.",
    status: "read",
    category: "ticket",
    channel: "Ticket",
    timestamp: subtractMinutes(180),
    highlight: true,
  },
  {
    id: "ntf-6",
    title: "Nova mensagem",
    message: "Michael Brown mencionou você em um comentário no ticket #1236.",
    status: "read",
    category: "message",
    channel: "Mensagem",
    timestamp: subtractMinutes(300),
  },
  {
    id: "ntf-7",
    title: "Atualização de equipe",
    message: "Prazo do projeto redefinido para 15 de junho de 2024.",
    status: "read",
    category: "team",
    channel: "Equipe",
    timestamp: subtractMinutes(1440),
  },
  {
    id: "ntf-8",
    title: "Novo ticket criado",
    message: "Um novo ticket foi criado: #1237 - Integração com API.",
    status: "read",
    category: "ticket",
    channel: "Ticket",
    timestamp: subtractMinutes(2880),
  },
  {
    id: "ntf-9",
    title: "Atualização de sistema",
    message: "Plano mensal atualizado com novas funcionalidades.",
    status: "read",
    category: "system",
    channel: "Sistema",
    timestamp: subtractMinutes(4320),
  },
];
