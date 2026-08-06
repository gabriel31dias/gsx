// Máscaras e helpers do cartão. Nada aqui persiste dados: só formata o que o
// usuário digita antes do POST, que é o único lugar por onde o cartão passa.

export const maskCardNumber = (value: string) =>
  value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

export const maskExpiration = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

// "12/2030" ou "12/30" -> { month: "12", year: "2030" }
export const splitExpiration = (value: string) => {
  const [month = '', year = ''] = value.split('/');
  return { month, year: year.length === 2 ? `20${year}` : year };
};

export interface CardForm {
  number: string;
  holderName: string;
  expiration: string;
  cvv: string;
}

export const EMPTY_CARD: CardForm = { number: '', holderName: '', expiration: '', cvv: '' };

// Payload que o back espera em `card`.
export const cardPayload = (card: CardForm) => {
  const { month, year } = splitExpiration(card.expiration);
  return {
    number: card.number.replace(/\D/g, ''),
    holder_name: card.holderName,
    expiration_month: month,
    expiration_year: year,
    cvv: card.cvv,
  };
};

// Só o que o back devolve do cartão: nada de número completo ou CVV.
export interface SubscriptionResult {
  id: string;
  status: string;
  interval: string;
  card: { brand?: string; last4?: string; holder_name?: string; expiration?: string };
  next_charge_at?: string | null;
}
