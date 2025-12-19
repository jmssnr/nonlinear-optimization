import { Matrix } from "@/core/linear-algebra/matrix";

export const bfgs = (sk: Matrix, yk: Matrix, Qk: Matrix) => {
  const skT_yk = sk.transpose().multiply(yk).get(0, 0);
  const skT_Qk_sk = sk.transpose().multiply(Qk).multiply(sk).get(0, 0);
  const theta =
    skT_yk >= 0.2 * skT_Qk_sk ? 1 : (0.8 * skT_Qk_sk) / (skT_Qk_sk - skT_yk);
  const rk = yk.scale(theta).add(Qk.multiply(sk).scale(1 - theta));

  const skT_rk = sk.transpose().multiply(rk).get(0, 0);

  return Qk.subtract(
    Qk.multiply(sk)
      .multiply(sk.transpose())
      .multiply(Qk)
      .scale(1 / skT_Qk_sk),
  ).add(rk.multiply(rk.transpose()).scale(1 / skT_rk));
};
