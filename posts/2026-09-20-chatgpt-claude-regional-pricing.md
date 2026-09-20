---
title: ChatGPT and Claude subscription prices: UK, US, Canada and Turkey compared
date: 2026-09-20
category: Toolkit
tables: true
summary: A regional pricing survey of ChatGPT Plus and Pro, and Claude Max. Apple and web prices, local taxes, exchange rates and gift-card costs need separate treatment before a cheaper country can be identified.
---

I started this investigation with a practical question: how much does the same AI subscription cost in different countries? The answer changed when I separated Apple purchases from web subscriptions and added the tax missing from some Canadian comparisons.

This is a **four-market snapshot dated 20 September 2026**, covering the UK, the US, Canada with Ontario tax, and a supplementary Turkish App Store comparison. It focuses on ChatGPT Plus and Pro, with Go and Claude Max for context. It is not a complete global ranking, a comparison of API token prices, or a record of subscriptions purchased in every country.

The clearest finding is that the cheapest region depends on the plan and channel. In this price snapshot, Ontario Apple is cheaper than UK Apple for ChatGPT Plus and Pro 20x, but more expensive for Pro 5x once Ontario's tax is included. A reported Ontario web quote would reverse that Pro 5x result, but it still needs a complete checkout to confirm it.

# What the numbers mean

I use four evidence labels throughout this article:

- **Store listing:** a price displayed on an official regional App Store page. It is not proof that a particular account can buy that plan.
- **Calculated total:** a listed price with the stated local tax added, then converted to pounds. No checkout receipt was obtained.
- **Reported quote:** a price reported without its original checkout screenshot. The amount and its tax treatment remain conditional.
- **Scenario:** arithmetic using an explicitly assumed price or tax rate. It is not a verified local offer.

All amounts are monthly. An unknown price or tax rate stays unknown. Different products' “5x” and “20x” labels refer to their own plan allowances; they are not a common unit of computing capacity across OpenAI and Anthropic. See [OpenAI's Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers) and [Anthropic's Max plan](https://support.claude.com/en/articles/11049741-what-is-the-max-plan).

# Put tax and currency on the same basis

The UK Apple consumer prices below are treated as tax-inclusive. Do not add another 20% to them. Apple's pricing explanation identifies the US and Canada as exceptions to its usual tax-inclusive storefront display. Ontario's online-subscription example uses 13% HST; that is the Canadian location used here, not a Canada-wide tax rate. The US needs a specific applicable state and local tax treatment before a final total can be calculated. Sources: [Apple pricing](https://developer.apple.com/videos/play/tech-talks/110364/), [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/charge-collect/cross-border.html), and [UK VAT rates](https://www.gov.uk/vat-rates).

The conversions use the following reference rates, checked against the [Bank of Canada daily exchange-rate table](https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/) for **18 September 2026**:

| One unit of currency | Value in CAD |
| --- | ---: |
| GBP | 1.8721 |
| USD | 1.4002 |
| TRY | 0.02870 |

For an exclusive price, tax is rounded to the nearest local cent using half-up rounding before it is added to the price. The local total is then converted to GBP, with intermediate precision retained and only the displayed result rounded to two decimals. An already inclusive price is converted without adding tax again.

```text
CAD total / 1.8721 = GBP estimate
USD total * 1.4002 / 1.8721 = GBP estimate
TRY total * 0.02870 / 1.8721 = GBP estimate
```

These conversions exclude bank exchange-rate spreads, card fees, gift-card premiums and payment-processing charges. A small apparent saving can disappear once those costs are included.

# ChatGPT Pro 5x: the channel changes the answer

The UK Apple reference is **£88.90 including VAT**. The Canadian Apple listing is **CA$152.99 before Ontario HST**. Adding CA$19.89 of tax gives CA$172.88, or approximately **£92.35**. Ontario Apple is therefore about **£3.45 more per month** in this comparison. Sources: [UK ChatGPT App Store](https://apps.apple.com/gb/app/chatgpt/id6448311069?platform=ipad) and [Canadian ChatGPT App Store](https://apps.apple.com/ca/app/chatgpt/id6448311069?platform=ipad).

Separately, an unverified Ontario web report gives **CA$136**. There is no original checkout screenshot establishing whether it is a full monthly subtotal, a tax-inclusive amount, or an upgrade charge. **Only if it is the full tax-exclusive monthly price** does the following calculation apply:

```text
Reported subtotal:       CA$136.00
Ontario HST at 13%:       CA$17.68
Conditional total:      CA$153.68
Converted estimate:        £82.09
```

| Pro 5x route | Local total | GBP per month | Evidence |
| --- | ---: | ---: | --- |
| UK Apple | £88.90 | £88.90 | Store listing, tax included |
| Ontario Apple | CA$172.88 | £92.35 | Store listing + calculated HST |
| Ontario web, conditional | CA$153.68 | £82.09 | Reported quote; unverified tax-exclusive subtotal |

The conditional web saving is approximately **£6.81 per month** against UK Apple. Multiplying the unrounded difference by 12 gives **£81.72**, assuming the price, tax and exchange rate all remain unchanged. That is an annualised comparison, not an annual subscription offer. It would be misleading to compare the conditional CA$153.68 web total directly with Apple’s CA$152.99 subtotal and call them almost the same price.

# ChatGPT Apple prices across the four markets

This table keeps the original currency visible. Ontario's final column includes calculated 13% HST; UK and Turkish listings are treated as inclusive. Sources: ChatGPT App Store listings for the [UK](https://apps.apple.com/gb/app/chatgpt/id6448311069?platform=ipad), [Canada](https://apps.apple.com/ca/app/chatgpt/id6448311069?platform=ipad), and [Turkey](https://apps.apple.com/tr/app/chatgpt/id6448311069?platform=ipad).

| ChatGPT plan | UK Apple, tax included | Canada Apple, before tax | Ontario total → GBP | Turkey total → GBP |
| --- | ---: | ---: | --- | --- |
| Go | £6.99 | CA$12.99 | CA$14.68 → £7.84 | ₺249.99 → £3.83 |
| Plus | £19.99 | CA$24.99 | CA$28.24 → £15.08 | ₺999.99 → £15.33 |
| Pro 5x | £88.90 | CA$152.99 | CA$172.88 → £92.35 | ₺5,299.99 → £81.25 |
| Pro 20x | £200.00 | CA$249.00 | CA$281.37 → £150.30 | ₺9,999.99 → £153.30 |

For **Plus**, Ontario Apple is about **£4.91 below UK Apple**, and only about £0.25 below Turkish Apple before payment costs. For **Pro 20x**, Ontario is about **£49.70 below UK Apple** and **£3.00 below Turkish Apple**. A comparison using Canada's untaxed CA$249 would exaggerate both differences. Turkey is lower than Ontario for Go and Pro 5x, so one country cannot be labelled cheapest across all four plans.

The US is separate because no tax jurisdiction has been selected. These are [US App Store](https://apps.apple.com/us/app/chatgpt/id6448311069) listings, **not final nationwide prices**:

| ChatGPT plan | US Apple listing | Final total |
| --- | ---: | --- |
| Go | US$8.00 | Add applicable tax |
| Plus | US$19.99 | Add applicable tax |
| Pro 5x | US$100.00 | Add applicable tax |
| Pro 20x | US$200.00 | Add applicable tax |

In an explicitly assumed **0% tax scenario**, US$100 converts to £74.79 and US$200 to £149.59. Those are illustrations only. An unknown US tax rate must not silently become zero.

## Pro 20x has a separate availability issue

OpenAI's Pro help page states that new subscriptions and upgrades to **Pro $200 / 20x have been paused since 10 September 2026**. Existing subscriptions can continue renewing. Some former subscribers qualify for a one-time paid return within 30 days after their access ends, subject to the page's historical eligibility conditions. A listed App Store price therefore does not establish that a new customer can purchase it. Check the [current Pro rules](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers) before changing a subscription.

# Web prices need their own evidence

OpenAI supports localized web billing in currencies including GBP and CAD, while Apple and Google manage their own app subscriptions. That makes a UK Apple amount an unreliable substitute for a missing UK web quote. The same applies in Canada. See [OpenAI's multi-currency billing explanation](https://help.openai.com/en/articles/10421635-multicurrency-billing).

| ChatGPT web market | What this investigation establishes |
| --- | --- |
| UK | Local Plus, Pro 5x and Pro 20x checkout totals remain unverified |
| Ontario | Pro 5x CA$136 is a conditional reported quote; Plus and Pro 20x remain unverified |
| US | Pro reference prices are US$100 and US$200 before applicable tax; the 20x pause still applies |
| Turkey | No complete local web checkout table was obtained |

The missing web amounts are intentional. Neither multiplying the Canadian 5x quote nor copying Apple's regional prices would verify them.

# Claude Max: separate Apple from the web

Claude's regional Apple listings show a different set of prices. The Ontario totals again add 13% HST. Sources: Claude App Store listings for the [UK](https://apps.apple.com/gb/app/claude-by-anthropic/id6473753684), [Canada](https://apps.apple.com/ca/app/claude-by-anthropic/id6473753684), and [US](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684).

| Claude plan | UK Apple, tax included | Canada Apple, before tax | Ontario total → GBP | US Apple, before tax |
| --- | ---: | ---: | --- | ---: |
| Max 5x | £119.99 | CA$179.99 | CA$203.39 → £108.64 | US$124.99 |
| Max 20x | £249.99 | CA$349.99 | CA$395.49 → £211.25 | US$249.99 |

CA$349.99 and US$249.99 use different currencies. Dividing those two sticker prices does not measure a percentage price difference.

Anthropic quotes **US$100 for Max 5x and US$200 for Max 20x on the web**, and explicitly says mobile pricing can differ. This survey did not obtain UK or Ontario web checkout totals. The following table is therefore a **scenario**, assuming the full monthly web charge really is denominated in USD at those base prices. Source: [Claude Max plan pricing](https://support.claude.com/en/articles/11049741-what-is-the-max-plan).

| Assumed web scenario | Max 5x total → GBP | Max 20x total → GBP |
| --- | --- | --- |
| USD base + UK 20% VAT | US$120 → £89.75 | US$240 → £179.50 |
| USD base + Ontario 13% HST | US$113 → £84.52 | US$226 → £169.03 |
| USD base + assumed US 0% tax | US$100 → £74.79 | US$200 → £149.59 |

These scenarios cannot establish that a Canadian or UK account will be offered that currency and subtotal. Anthropic also says that Pro and Max billing addresses follow the payment method's billing address, which affects tax calculation. A payment card alone is not a promise of a particular country's tax treatment. See [Claude billing addresses and taxes](https://support.claude.com/en/articles/12997130-understanding-your-billing-address-and-tax-calculation).

# What the Turkish Apple ID and gift-card guides add

Two community references explain why Turkey appears in these discussions: the [Linux.do Apple ID guide](https://linux.do/t/topic/2021625) contains users' regional-account experiences, and the [Turkish Apple ID / ChatGPT Plus checklist](https://tkgptplus.bigbiscuit.fun/#gift-card) describes buying and redeeming Turkish Apple gift cards, including an Oyunfor route. The checklist also contains third-party subscription promotion. I have not tested or endorsed the merchants, payment routes or account-change methods it describes.

Their role here is to identify a possible payment channel and its extra costs. They do not independently establish current subscription prices or eligibility. The amount paid for a gift card may differ from the converted value of its face amount; unused balance also ties up money that has not yet bought subscription time.

Apple says account balance can pay for in-app purchases and some subscriptions, but some purchases still require a card on file and some subscriptions cannot use that balance. Its region-change requirements also include clearing the balance, resolving blocking subscriptions and potentially providing a valid payment method for the new region. Sources: [Apple account-balance uses](https://support.apple.com/en-gb/118245) and [changing account country or region](https://support.apple.com/en-gb/118283).

For a gift-card route, the useful calculation is the actual amount charged in the buyer's currency, including any processing or exchange fees, allocated to the credit consumed by the subscription. A retailer's discount or a community success report is not enough to confirm that figure for another buyer. Nothing in these tables establishes service access, regional account eligibility or a right to share a personal AI account.

# What remains to be checked

The highest-value missing evidence is the Ontario ChatGPT Pro 5x checkout: currency, full monthly subtotal, HST, total, and whether the quote is for a new purchase, renewal or upgrade. The next gaps are UK and Ontario web quotes for the other plans, a specified US tax jurisdiction, and measured gift-card payment costs. Any supporting screenshot should omit names, addresses, card details and redemption codes.

The [downloadable data snapshot](downloads/ai-subscription-prices-2026-09-20.json) preserves original currencies, tax assumptions, unknown values and separate scenario records. Its amounts are decimal strings. It contains no verified checkout receipts and is not a live pricing feed.

For my own comparison, I would first select the plan and channel I actually need, then compare the final tax-inclusive amounts in one currency, and only then check whether the purchase is available to me. That order is what turns a regional sticker-price list into a useful cost comparison.
