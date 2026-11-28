---
# Synced by `npm run sync:legal` from the app repo. Do not edit here: edit docs/legal/privacy-policy.md in the app repo and re-sync.
title: "Aftertaste Privacy Policy"
source: "docs/legal/privacy-policy.md"
sourceCommit: "c4d9e818710609825b3b26ea977c14881fb800a4"
sourceUpdated: "2026-11-24"
syncedAt: "2026-11-26"
---
<!-- draft-notes
DRAFT for the human to review. Not legal advice. Resolve any open placeholder before publishing.
Facts below were taken from the code on work-branch (2026-11-11): see docs/google-content-review.md for the Google content that is stored today.
If the review's recommendations are implemented (stop copying Google photos, coordinate TTL, stop storing addresses), update section 4 to match.
/draft-notes -->

# Aftertaste Privacy Policy

**Effective date:** 23 December 2026

The AI taste report section (section 8) applies from 25 November 2026.

Aftertaste is a private food diary for iOS and Android. You keep a list of places you have eaten at, log visits and dishes with photos and ratings, and keep a private list of places you want to try. This policy explains what the app collects, why, who else handles it, and how to delete it. We have tried to keep it short and plain.

**Who is responsible:** Paras D Prasad, an individual in India. Contact: [hello@theaftertaste.app](mailto:hello@theaftertaste.app).

## 1. What we collect

**Your account.** You sign in with Google. We receive and keep the name, email address and profile-picture reference that your Google account shares with us. We never see your Google password, and there are no other sign-in methods.

**What you write in the app (your diary).** Places, visits (date, overall rating, note), dishes (name, taste and value ratings, price and currency, tags, veg/non-veg/vegan, note), your "recommended" and "would go again" answers for a place, and your favourite dishes.

**Photos you add.** Dish photos (up to three per dish), place cover photos and your profile picture. They are stored in a private storage area and shown through short-lived links.

**Your "Want to try" list.** Places you save to try later, with an optional note. It is private to you (see section 7).

**Settings.** Your country, preferred currency, whether your diary is discoverable (off by default) and the light or dark theme. Your recent searches are kept on your device only.

**If you turn on the AI taste report (off by default).** Your latest report, a cuisine / dish type / flavour label for each of your dishes, and the date you turned it on (section 8).

**What we do not collect.** There is no advertising, no analytics, no crash-reporting service and no tracking across apps or websites in Aftertaste. We do not sell your data.

## 2. How we use it

Only to run the app: to sign you in, to store and show your diary, photos and lists, to search for places, to let you export or delete your data, if you turn it on, to let other Aftertaste users see your diary (section 7), and, if you turn it on, to write your AI taste report (section 8).

## 3. Your location

Aftertaste asks for location only while the app is in use and only the first time you search for a place. It never asks for background location.

- We use it to put places near you first in search results and to show distances. If you allow only approximate location, results are approximate.
- Your position is held in the app's memory. We do not save it in our database and we do not write it to our logs.
- To rank results, the position is sent to our search service, which passes it to Google Places. Google handles it under its own privacy policy.
- If you decline, search still works. In that case the app uses the middle point of the places already in your diary (or your profile country) to rank results, and sends that point to Google in the same way.
- You can withdraw permission at any time in your phone's settings.

## 4. Google Places and Google Maps

Place search, place pages and maps use Google services. What this means for your data:

- What you type into place search, and a place's identifier, are sent to our search service and on to Google.
- The Google place page (rating, hours, phone, website, photos) is fetched from Google when you open it. It is kept only briefly in the app's memory and is not saved to your diary.
- Some place details (name, address, location and cover photo) come from Google Maps. We are reducing what we store, in line with Google's terms.
- Maps are drawn by the Google Maps SDK, which exchanges data with Google (for example map requests and device information) under Google's terms.

Google's own terms and privacy policy are linked from the app (Profile, Legal and attributions): [Google Maps Additional Terms](https://maps.google.com/help/terms_maps/), [Google Terms](https://policies.google.com/terms), [Google Privacy Policy](https://policies.google.com/privacy).

## 5. Who else handles your data

- **Supabase** hosts our database, sign-in, photo storage and the search service. It processes your data for us. Our data is hosted in Sydney, Australia (region ap-southeast-2).
- **Google** provides Sign-In, Places and Maps (section 4).
- **Anthropic** provides the Claude model that writes the AI taste report, only if you turn it on (section 8). It processes that data for us as our service provider.
- **Google Play and RevenueCat (store builds only).** If you leave an optional tip in the Play Store version, Google Play processes the payment and RevenueCat records the purchase against a random anonymous ID that contains no name, email or Aftertaste account ID. We never see your payment details.
- **Buy Me a Coffee and UPI (direct, non-store builds only).** The Support screen links to Buy Me a Coffee and can open your UPI app or copy a UPI ID. Those open outside Aftertaste and are covered by their own policies. We do not receive your payment details.

We do not share your data with anyone else, except where the law requires it.

## 6. Where data is kept on your phone

Your sign-in token and settings are kept in the phone's secure storage. A short-lived copy of recently viewed diary data is cached on the device to make the app faster. Signing out or deleting your account clears that cache and any export file the app made.

## 7. Discoverable diaries: what other people can see

Your diary belongs to your account only; nobody else can add to it. By default your diary is visible only to you. In Profile you can switch on "share my diary". While it is on, other signed-in Aftertaste users, not only people you know, can find and see:

- your name and profile picture;
- the places you added (name, category, city, address, position on the map, cover photo) and your "recommended" answer;
- the dates and overall ratings of your visits;
- your dishes: name, photos, taste and value ratings, price, tags and veg/non-veg/vegan type.

**Always private, even when sharing is on:** your notes (visit and dish notes), your "would go again" answer, your favourites, your "Want to try" list, your email address and your settings.

Other users can save a place of yours to their own private list. Switching sharing off removes your diary from other people's views; anything they already saved to their own list stays theirs.

Your diary belongs to your account only; nobody else can add to it.

## 8. AI taste report (optional) {#ai-taste-report}

The taste report is off until you turn it on (Profile, Your taste report). It is a monthly look at how you eat: your go-to dishes, your rhythm, your best-value bite. Aftertaste's own code calculates every number in it from your diary. An AI model only writes the short lines of text around those numbers.

**What is sent to the AI.** Two things, and nothing else:

- the names of your dishes, so each can be labelled with a cuisine, a dish type and flavours from a fixed list;
- statistics we calculate from your diary: counts, averages, ratings, percentages, prices in your currency, and how many days something has been waiting. Your places, dishes and saved places appear in these statistics only as placeholders such as "place 1"; the app swaps in the real names on your phone.

**What is never sent:** your notes, photos, place names, addresses, cities, map positions, your device's location, the dates of your visits, your name, email address or account ID, and anything about other people.

**Who receives it.** Anthropic, through its Claude API, which processes it for us as our service provider. By default, Anthropic does not use data sent through its API, or what the model writes, to train its models. Anthropic keeps it only for a limited time under its API data retention policy, and longer only where needed to enforce its usage policy or required by law.

**What we keep, and for how long.**

- Your latest report (the numbers and the words) is kept until a newer report replaces it, you turn the feature off, or you delete your account. We do not keep older reports.
- The labels for your dishes are kept until you rename a dish (it is then labelled again), turn the feature off, or delete your account.
- To enforce the limit of three manual refreshes a month, we keep how many times you refreshed each month and the date of your first report, even if you turn the feature off; these are deleted with your account.
- While it is on, the report refreshes once a week if you logged something new. A queue entry for that weekly run (your account ID, the week and whether it worked, plus the numbers calculated for your report while it is being written) is deleted after eight weeks, or when you turn the feature off; the numbers are removed as soon as the report is saved.
- Our server logs a scrambled ID, the size of each request, timings and whether our checks passed. They contain none of your text.

**Turning it off.** Profile, AI taste report, Turn off. New reports stop, and your current report and dish labels are deleted straight away. Your data export includes your latest report and dish labels.

## 9. How long we keep it, and deleting it {#delete-your-data}

We keep your data while your account exists. You can:

- **Export it:** Profile, Settings, Export my data. The app builds a zip file (your data as JSON and HTML plus your photos) on your phone and opens the share sheet. We do not receive a copy.
- **Delete it:** Profile, Settings, Delete account. The app shows how many places, visits and dishes will be deleted, then creates an export for you to save or share first (if the export fails you can retry, or choose to delete without it). Deleting removes your account, diary, wish list, photos, profile picture and, if you used it, your taste report, dish labels and refresh counts from our systems. It cannot be undone.
- **Backups:** We don't currently keep separate backups. Your data is stored with our hosting provider, Supabase. If we start keeping backups, we'll update this policy.
- **Ask us:** if you cannot use the app, email hello@theaftertaste.app from your sign-in address and we will delete the account.

Our search service keeps a short-lived log of request counts per account (account ID and time only) to limit abuse. It contains no search text or location.

## 10. Security

Everything travels over HTTPS. Photos are in a private bucket. The database enforces per-account access rules, so one account cannot read another's private data. No system is perfectly secure; if we learn of a breach affecting you we will tell you as the law requires.

## 11. Your choices and rights

You can access, correct, export or delete your data at any time in the app (Profile → Settings), or by emailing hello@theaftertaste.app. We'll respond within 30 days. You can also turn discoverability or the AI taste report off, and withdraw location or camera permission in your phone's settings. Depending on where you live (for example under India's Digital Personal Data Protection Act or the EU/UK GDPR) you may have further rights, including to complain to a data protection authority.

## 12. Children

Aftertaste is not directed at children under 13, and Google sign-in is not available to children below the age set by Google for their country. We do not knowingly collect data from them. If you believe a child has an account, contact us and we will delete it.

## 13. International processing

Our service providers (Supabase, Google, Anthropic if you turn on the taste report, and on store builds Google Play and RevenueCat) may process data in countries other than yours. Our main data is hosted in Australia (Sydney), so using Aftertaste means your data is transferred outside India and, depending on where you live, outside your country.

## 14. Website beta list {#beta-list}

If you join the beta list on our website (https://theaftertaste.app), we collect your email address and, optionally, your city and how you heard about us. We use it only to send beta invites and launch updates. It is stored with Cloudflare, kept until 6 months after launch or until you ask to be removed, whichever is first, and is never sold or shared. To be removed, email hello@theaftertaste.app. To prevent abuse, the form counts attempts using a scrambled code derived from your network address. The address itself is never stored; the code changes every hour, can't be traced back to you, and old codes are deleted automatically.

## 15. Changes

We'll update the date at the top. For significant changes, we'll also show a notice in the app.

## 16. Contact

[hello@theaftertaste.app](mailto:hello@theaftertaste.app)
