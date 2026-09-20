---
title: ChatGPT and Claude subscription prices: UK, US, Canada and Turkey compared
date: 2026-09-20
category: Toolkit
tables: true
summary: Ontario ChatGPT Pro 5x on the web is CA$136 before 13% HST, or CA$153.68 including tax. Compare official web and Apple prices for ChatGPT and Claude across the UK, US, Canada and Turkey.
---

**ChatGPT Pro 5x on the web costs CA$136 before tax in Canada. For Ontario, adding 13% HST gives CA$153.68 per month**, approximately **£82.09** at the reference exchange rate used here. OpenAI's [Canadian web pricing configuration](https://chatgpt.com/backend-api/checkout_pricing_config/configs/CA) explicitly marks the monthly amount as tax-exclusive. This is a different price from the Canadian Apple subscription.

I started this investigation to compare the cost of the same AI subscription across countries. For Pro 5x, the useful comparison is Ontario web **£82.09 including calculated tax**, UK web **£89 including VAT**, and UK Apple **£88.90 including VAT**. The Ontario web price is about **£6.91 below UK web**, or **£6.81 below UK Apple**. Sources: [OpenAI UK web configuration](https://chatgpt.com/backend-api/checkout_pricing_config/configs/GB), [UK Apple listing](https://apps.apple.com/gb/app/chatgpt/id6448311069?platform=ipad), and the tax and exchange-rate sources below.

This is a **four-market snapshot dated 20 September 2026**, covering the UK, the US, Canada with Ontario tax, and a supplementary Turkish App Store comparison. It focuses on ChatGPT Plus and Pro, with Go and Claude Max for context. It is not a complete global ranking, a comparison of API token prices, or a record of subscriptions purchased in every country.

**Correction — 20 September 2026:** the first version treated the CA$136 web price and its tax basis as an unresolved report. OpenAI's regional pricing configuration confirms both. The CA$153.68 calculation was already correct; the evidence description and the emphasis of the comparison were not. This version uses the official web source and fills the ChatGPT web-price gaps.

# What the numbers mean

I use four evidence labels throughout this article:

- **Official web price:** a monthly amount, currency and tax basis read from OpenAI's regional pricing configuration. This verifies the configured standard price, not an individual's checkout or eligibility.
- **Store listing:** a price displayed on an official regional App Store page, kept separate from the web price.
- **Calculated total:** a listed price with the stated local tax added, then converted to pounds. No checkout receipt was obtained.
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

# ChatGPT Pro 5x: Ontario web is CA$153.68 after tax

The Canadian web configuration identifies the currency as **CAD** and gives the Pro 5x monthly price under the `prolite` key as **136**, with `tax: exclusive`. This agrees with the local Canadian observation that prompted the investigation. The US configuration uses US$100 for the same key; OpenAI's plan documentation identifies the US$100 tier as Pro 5x. Sources: [Canadian configuration](https://chatgpt.com/backend-api/checkout_pricing_config/configs/CA), [US configuration](https://chatgpt.com/backend-api/checkout_pricing_config/configs/US), and [Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers).

The Canada Revenue Agency's [online-subscription example](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/charge-collect/cross-border.html) applies **13% HST** to an Ontario consumer. The calculation is:

```text
Official web subtotal:   CA$136.00
Ontario HST at 13%:       CA$17.68
Calculated total:       CA$153.68
Converted estimate:        £82.09
```

| Pro 5x route | Listed price | Tax treatment | Final local total → GBP |
| --- | ---: | --- | --- |
| Ontario web | CA$136.00 | Add CA$17.68 HST | **CA$153.68 → £82.09** |
| UK web | £89.00 | VAT already included | £89.00 → £89.00 |
| UK Apple | £88.90 | VAT already included | £88.90 → £88.90 |
| Ontario Apple | CA$152.99 | Add CA$19.89 HST | CA$172.88 → £92.35 |

Sources for the separate Apple channel: [UK ChatGPT App Store](https://apps.apple.com/gb/app/chatgpt/id6448311069?platform=ipad) and [Canadian ChatGPT App Store](https://apps.apple.com/ca/app/chatgpt/id6448311069?platform=ipad). The Canadian **CA$152.99 figure is Apple's pre-tax listing, not the web price**. Ontario web is CA$19.20, approximately £10.26, cheaper per month than Ontario Apple after both include HST.

Against UK web, the saving is approximately **£6.91 per month**, or **£82.92 over 12 months** at unchanged prices, tax and exchange rates. Against UK Apple it is **£6.81 per month**, or **£81.72 over 12 months**. These annualised figures use unrounded monthly differences; they are not annual subscription offers.

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

# ChatGPT web prices from the official regional configuration

OpenAI's regional configuration provides both the local currency and whether the monthly price includes tax. The following web prices were read from those official sources on 20 September 2026. These are standard monthly prices; promotion fields, annual fields and account-specific credits are outside this comparison. Apple and Google manage separate billing channels, as described in [OpenAI's multi-currency billing explanation](https://help.openai.com/en/articles/10421635-multicurrency-billing).

| ChatGPT web plan | UK, VAT included | Canada, before tax | Ontario total → GBP | US, before tax |
| --- | ---: | ---: | --- | ---: |
| Go | £7.00 | CA$11.00 | CA$12.43 → £6.64 | US$8.00 |
| Plus | £20.00 | CA$25.00 | CA$28.25 → £15.09 | US$20.00 |
| Pro 5x | £89.00 | CA$136.00 | CA$153.68 → £82.09 | US$100.00 |
| Pro 20x | £200.00 | CA$250.00 | CA$282.50 → £150.90 | US$200.00 |

Sources: official web pricing configurations for the [UK](https://chatgpt.com/backend-api/checkout_pricing_config/configs/GB), [Canada](https://chatgpt.com/backend-api/checkout_pricing_config/configs/CA), and [US](https://chatgpt.com/backend-api/checkout_pricing_config/configs/US). Pro 20x availability remains subject to the pause described above. US final totals still require the applicable tax jurisdiction.

The [Turkish web configuration](https://chatgpt.com/backend-api/checkout_pricing_config/configs/TR) currently specifies **USD**, with Go US$6 tax-inclusive, Plus US$20 tax-exclusive, Pro 5x US$120 tax-inclusive, and Pro 20x US$200 tax-exclusive. Its Pro 5x total converts to approximately **£89.75**. Those are web-configuration amounts; the TRY prices in the earlier table belong to Apple. This survey leaves the final tax on the Turkish tax-exclusive web entries unresolved.

The official configuration establishes a stronger price basis than a third-party comparison or a reader report. It still does not establish a particular account's renewal price, promotion, payment fees or eligibility. A [dated extract of the monthly configuration](downloads/openai-web-pricing-config-2026-09-20.json) is saved with this article so the figures and tax flags can be inspected later.

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

The Canadian Pro 5x standard web amount and its tax-exclusive basis are now confirmed by OpenAI's own configuration. What remains untested is an account-specific checkout or paid receipt, including any credit, promotion or renewal variation. Other gaps are Claude's UK and Ontario web checkout totals, applicable US tax, tax on the Turkish tax-exclusive web entries, and measured gift-card payment costs. Any supporting screenshot should omit names, addresses, card details and redemption codes.

The [downloadable data snapshot](downloads/ai-subscription-prices-2026-09-20.json) preserves original currencies, tax assumptions, unknown values and separate scenario records. Its amounts are decimal strings. It contains no verified checkout receipts and is not a live pricing feed.

For my own comparison, I would first select the plan and channel I actually need, then compare the final tax-inclusive amounts in one currency, and only then check whether the purchase is available to me. That order is what turns a regional sticker-price list into a useful cost comparison.
