import { Link } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import { contact } from "../data/contact";

const LAST_UPDATED = "4 October 2026";

const LegalPage = ({ title, intro, sections }) => (
  <div className="page-container">
    <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: title }]} />
    <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface px-5 py-7 sm:px-10 sm:py-10">
      <h1 className="text-[26px] font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1 text-[13px] text-muted">Last updated: {LAST_UPDATED}</p>
      <p className="mt-5 leading-relaxed">{intro}</p>
      {sections.map(({ heading, body }) => (
        <section key={heading} className="mt-7">
          <h2 className="mb-2 text-lg font-bold">{heading}</h2>
          <div className="flex flex-col gap-2 leading-relaxed text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
            {body}
          </div>
        </section>
      ))}
      <section className="mt-7 rounded-xl bg-canvas p-4">
        <h2 className="mb-1 font-bold">Questions?</h2>
        <p className="leading-relaxed text-muted">
          Contact our customer care team at <a href={`mailto:${contact.email}`}>{contact.email}</a> or call{" "}
          {contact.phone} ({contact.hours}).
        </p>
      </section>
    </article>
  </div>
);

export const Terms = () => (
  <LegalPage
    title="Terms & Conditions"
    intro="These terms govern your use of the Teams24 website and any purchase you make from us. By creating an account or placing an order, you agree to these terms."
    sections={[
      {
        heading: "1. Your account",
        body: (
          <p>
            You are responsible for keeping your login details confidential and for all activity under your account.
            Please provide accurate information and keep it up to date. We may suspend accounts that are used
            fraudulently or in breach of these terms.
          </p>
        ),
      },
      {
        heading: "2. Products and pricing",
        body: (
          <ul>
            <li>All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</li>
            <li>
              We try to show products, prices and stock accurately, but errors can happen. If a price is wrong, we will
              contact you before processing the order or cancel it with a full refund.
            </li>
            <li>Product images are for illustration and the actual item may vary slightly.</li>
          </ul>
        ),
      },
      {
        heading: "3. Orders and payment",
        body: (
          <ul>
            <li>
              An order is confirmed only after we accept it. We may decline or cancel an order, for example if an item
              is out of stock or payment fails.
            </li>
            <li>
              You can cancel an order from My Account while it is pending or confirmed. Once it has been processed or
              shipped, it can no longer be cancelled.
            </li>
            <li>We accept UPI, credit/debit cards and cash on delivery where available.</li>
          </ul>
        ),
      },
      {
        heading: "4. Shipping",
        body: (
          <p>
            Shipping is free on orders of ₹500 or more after discounts; a flat delivery fee applies to smaller orders
            and is shown at checkout. Delivery times are estimates and may vary by location.
          </p>
        ),
      },
      {
        heading: "5. Returns and refunds",
        body: (
          <p>
            You can request a return within 7 days of delivery for most items, provided they are unused and in their
            original packaging. Approved refunds are made to the original payment method. Some items may not be
            returnable for hygiene or safety reasons; this will be stated on the product page.
          </p>
        ),
      },
      {
        heading: "6. Reviews",
        body: (
          <p>
            Reviews must be honest and relate to the product. We may remove reviews that are abusive, misleading, spam
            or unrelated. Reviews are marked as verified only when the reviewer has received the product.
          </p>
        ),
      },
      {
        heading: "7. Liability",
        body: (
          <p>
            To the extent permitted by law, our liability for any order is limited to the amount you paid for it.
            Nothing in these terms limits your rights as a consumer under applicable Indian law.
          </p>
        ),
      },
      {
        heading: "8. Changes to these terms",
        body: (
          <p>
            We may update these terms from time to time. The date at the top shows when they last changed. Please also
            read our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        ),
      },
    ]}
  />
);

export const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    intro="This policy explains what personal information Teams24 collects, how we use it, and the choices you have."
    sections={[
      {
        heading: "1. Information we collect",
        body: (
          <ul>
            <li>
              <strong>Account details:</strong> your name, email address, phone number and a securely hashed version of
              your password.
            </li>
            <li>
              <strong>Delivery details:</strong> the addresses you save for shipping.
            </li>
            <li>
              <strong>Shopping activity:</strong> your cart, wishlist, orders and any reviews you write.
            </li>
          </ul>
        ),
      },
      {
        heading: "2. How we use it",
        body: (
          <ul>
            <li>To create and manage your account and keep you signed in.</li>
            <li>To process, deliver and support your orders, including cancellations and returns.</li>
            <li>To show your reviews on product pages (with your name only).</li>
            <li>To keep the store secure and prevent fraud.</li>
          </ul>
        ),
      },
      {
        heading: "3. Sharing",
        body: (
          <p>
            We do not sell your personal information. We share it only where needed to run the store, for example with
            delivery and payment partners to fulfil your order, or when required by law.
          </p>
        ),
      },
      {
        heading: "4. Storage on your device",
        body: (
          <p>
            We store a sign-in token and, if you are not logged in, your cart in your browser&apos;s local storage so
            the site can remember you. Clearing your browser data removes them.
          </p>
        ),
      },
      {
        heading: "5. Data security and retention",
        body: (
          <p>
            Passwords are never stored in plain text. We keep your account information for as long as your account is
            active, and order records for as long as needed for accounting and legal purposes.
          </p>
        ),
      },
      {
        heading: "6. Your choices",
        body: (
          <p>
            You can view and update your profile and addresses at any time from My Account. To request a copy of your
            data or deletion of your account, contact us using the details below.
          </p>
        ),
      },
      {
        heading: "7. Changes to this policy",
        body: (
          <p>
            We may update this policy from time to time. The date at the top shows when it last changed. Please also
            read our <Link to="/terms">Terms & Conditions</Link>.
          </p>
        ),
      },
    ]}
  />
);
