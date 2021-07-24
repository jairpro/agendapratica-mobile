import {
  getContent,
} from './data';

import { sendText } from './sendText';

export async function exportData(): Promise<boolean> {
  const content = getContent()
  const sended = await sendText(content)

  if (!sended) {
    alert('😥 O envio de dados falhou.')
    return false
  }

  alert('😄 Dados enviados com sucesso!')
  return true
}

