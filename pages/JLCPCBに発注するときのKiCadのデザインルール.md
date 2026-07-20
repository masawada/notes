 - 調べてもこれというものがバシッと出てこない
 - このあたりから頑張って読み解く必要がある
	 - [PCB Manufacturing & Assembly Capabilities - JLCPCB](https://jlcpcb.com/capabilities/pcb-capabilities)
 - Board43を作るときに使ったデザインルールで怒られることはなかったので、当面はこれを利用できそう
	 - Board43とはこれのこと [Inside #Board43: 基板編 #rubykaigi - inSmartBank](https://blog.smartbank.co.jp/entry/inside-board43-pcb)
 - 製造能力が上がった結果、制約が緩くなることもあるらしい
	 - ほんまか?
 - ので2026年上半期時点での値ということで

## 銅線

| 項目            | 設定値           | 備考                               |
| ------------- | ------------- | -------------------------------- |
| 最小クリアランス      | 0.10 mm       | 1oz copperのとき                    |
| 最小配線幅         | 0.10 mm       | Multilayer は 0.09 mm 可（BGA 周辺のみ） |
| 最小接続幅         | 0.10 mm       | 配線幅と同等                           |
| 最小アニュラー幅（PTH） | 0.20 mm（推奨）   | 絶対最小：0.15 mm                     |
| 最小ビア直径        | 0.45 mm（実用最小） | hole 0.15 + annular 0.15×2       |
| 導体から穴のクリアランス  | 0.20 mm       | Via hole to track                |
| 導体から基板端クリアランス | 0.20 mm       | Routed edge                      |

---

## 穴（Drill / Hole）

| 項目           | 設定値     | 備考               |
| ------------ | ------- | ---------------- |
| 最小スルーホール径    | 0.15 mm | 2-layer 以上       |
| 穴から穴へのクリアランス | 0.20 mm | Via hole-to-hole |

---

## マイクロビア（Microvia）

※ 非対応（Blind / Buried Via はサポートされない）

| 項目         | 設定   |
| ---------- | ---- |
| 最小マイクロビア直径 | 使用不可 |
| 最小マイクロビア穴径 | 使用不可 |

とりあえず0でいれておけばOK

---

## シルクスクリーン（Legend / Silkscreen）

| 項目            | 設定値      | 備考                |
| ------------- | -------- | ----------------- |
| アイテムの最小クリアランス | 0.15 mm  | Pad to silkscreen |
| 最小テキスト高       | 1.0 mm   | 40 mil            |
| 最小テキスト線幅      | 0.153 mm | 6 mil             |

---

## 推奨 Net Class 例

### Default（量産・安全側）
- Track width：0.15 mm  
- Clearance：0.15 mm  
- Via：0.60 / 0.30 mm（径 / 穴）  
- Annular：0.15 mm  

### BGA / 高密度部
- Track width：0.09–0.10 mm  
- Clearance：0.09–0.10 mm  
- Via：0.45 / 0.15 mm  
- Annular：0.15 mm  

---

## 注意点

- 0.25 mm via径（annular 0.05 mm）は製造限界で非推奨  
- PTH annular 0.20 mm は推奨値（必須条件ではない）  
- V-cut 使用時は基板端クリアランス 0.4 mm に注意  
- BGA fan-out のみローカルルール緩和を前提とする