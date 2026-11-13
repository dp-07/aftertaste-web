---
# Synced by `npm run sync:legal` from the app repo. Do not edit here: edit docs/legal/privacy-policy.md in the app repo and re-sync.
title: "Aftertaste Privacy Policy"
source: "docs/legal/privacy-policy.md"
sourceCommit: "2d334170d543f3cbdd261ca97454cb6cc54866ad"
sourceUpdated: "2026-11-14"
syncedAt: "2026-11-13"
---
<!-- draft-notes
DRAFT for the human to review. Not legal advice. Resolve any open placeholder before publishing.
Facts below were taken from the code on work-branch (2026-11-11): see docs/google-content-review.md for the Google content that is stored today.
If the review's recommendations are implemented (stop copying Google photos, coordinate TTL, stop storing addresses), update section 4 to match.
/draft-notes -->

# Aftertaste Privacy Policy

**Effective date:** 23 November 2026

Aftertaste is a private food diary for iOS and Android. You keep a list of places you have eaten at, log visits and dishes with photos and ratings, and keep a private list of places you want to try. This policy explains what the app collects, why, who else handles it, and how to delete it. We have tried to keep it short and plain.

**Who is responsible:** Paras D Prasad, an individual in India. Contact: [hello@theaftertaste.app](mailto:hello@theaftertaste.app).

## 1. What we collect

**Your account.** You sign in with Google. We receive and keep the name, email address and profile-picture reference that your Google account shares with us. We never see your Google password, and there are no other sign-in methods.

**What you write in the app (your diary).** Places, visits (date, overall rating, note), dishes (name, taste and value ratings, price and currency, tags, veg/non-veg/vegan, note), your "recommended" and "would go again" answers for a place, and your favourite dishes.

**Photos you add.** Dish photos (up to three per dish), place cover photos and your profile picture. They are stored in a private storage area and shown through short-lived links.

**Your "Want to try" list.** Places you save to try later, with an optional note. It is private to you (see section 7).

**Settings.** Your country, preferred currency, whether your diary is discoverable (off by default) and the light or dark theme. Your recent searches are kept on your device only.

**What we do not collect.** There is no advertising, no analytics, no crash-reporting service and no tracking across apps or websites in Aftertaste. We do not sell your data.

## 2. How we use it

Only to run the app: to sign you in, to store and show your diary, photos and lists, to search for places, to let you export or delete your data, and, if you turn it on, to let other Aftertaste users see your diary (section 7).

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

## 8. How long we keep it, and deleting it {#delete-your-data}

We keep your data while your account exists. You can:

- **Export it:** Profile, Settings, Export my data. The app builds a zip file (your data as JSON and HTML plus your photos) on your phone and opens the share sheet. We do not receive a copy.
- **Delete it:** Profile, Settings, Delete account. The app shows how many places, visits and dishes will be deleted, then creates an export for you to save or share first (if the export fails you can retry, or choose to delete without it). Deleting removes your account, diary, wish list, photos and profile picture from our systems. It cannot be undone.
- **Backups:** We don't currently keep separate backups. Your data is stored with our hosting provider, Supabase. If we start keeping backups, we'll update this policy.
- **Ask us:** if you cannot use the app, email hello@theaftertaste.app from your sign-in address and we will delete the account.

Our search service keeps a short-lived log of request counts per account (account ID and time only) to limit abuse. It contains no search text or location.

## 9. Security

Everything travels over HTTPS. Photos are in a private bucket. The database enforces per-account access rules, so one account cannot read another's private data. No system is perfectly secure; if we learn of a breach affecting you we will tell you as the law requires.

## 10. Your choices and rights

You can access, correct, export or delete your data at any time in the app (Profile → Settings), or by emailing hello@theaftertaste.app. We'll respond within 30 days. You can also turn discoverability off, and withdraw location or camera permission in your phone's settings. Depending on where you live (for example under India's Digital Personal Data Protection Act or the EU/UK GDPR) you may have further rights, including to complain to a data protection authority.

## 11. Children

Aftertaste is not directed at children under 13, and Google sign-in is not available to children below the age set by Google for their country. We do not knowingly collect data from them. If you believe a child has an account, contact us and we will delete it.

## 12. International processing

Our service providers (Supabase, Google, and on store builds Google Play and RevenueCat) may process data in countries other than yours. Our main data is hosted in Australia (Sydney), so using Aftertaste means your data is transferred outside India and, depending on where you live, outside your country.

## 13. Website beta list {#beta-list}

If you join the beta list on our website (https://theaftertaste.app), we collect your email address and, optionally, your city and how you heard about us. We use it only to send beta invites and launch updates. It is stored with Cloudflare, kept until 6 months after launch or until you ask to be removed, whichever is first, and is never sold or shared. To be removed, email hello@theaftertaste.app. To prevent abuse, the form counts attempts using a scrambled code derived from your network address. The address itself is never stored; the code changes every hour, can't be traced back to you, and old codes are deleted automatically.

## 14. Changes

We'll update the date at the top. For significant changes, we'll also show a notice in the app.

## 15. Contact

[hello@theaftertaste.app](mailto:hello@theaftertaste.app)
