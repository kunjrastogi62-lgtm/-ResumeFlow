import { getHealthPayload } from '../server/ai-handlers';

export default function handler(_req: any, res: any) {
  return res.status(200).json(getHealthPayload());
}
