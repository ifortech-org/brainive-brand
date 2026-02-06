// contactform component file

"use client";

import { urlFor } from "@/shared/sanity/lib/image";
import { Image } from "sanity"; // Import the Image type from Sanity
import PortableTextRenderer from "@/shared/components/portable-text-renderer";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "../ui/textarea";
import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { toast } from "sonner";
import { PAGE_QUERYResult } from "@/sanity.types";
import { usePathname } from "next/navigation";

type ContactFormProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number],
  { _type: "contactform" }
>;

function ContactForm({
  title,
  description,
  button_text,
  side_image,
}: ContactFormProps) {
  let imageUrl =
    side_image && side_image.asset?._id ? urlFor(side_image).url() : "";
  let captchaRef = useRef<HCaptcha | null>(null);

  const pathname = usePathname();
  const isEnglish =
    pathname === "/en" || (pathname ? pathname.startsWith("/en/") : false);

  let [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  let [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    business_name: "",
    request: "",
    description: "",
  });

  function handleSubmit(e: any) {
    e.preventDefault();

    if (!hCaptchaToken) {
      toast(isEnglish ? "hCaptcha verification failed, please complete the check." : "Verifica hCaptcha fallita, Per favore, completa il controllo.");
      return;
    }

    fetch("/api/contactform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        business_name: formData.business_name,
        request: formData.request,
        description: formData.description,
        language: isEnglish ? "en" : "it",
        hCaptchaToken: hCaptchaToken,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          toast(
            isEnglish ? "Contact request successfully registered, you will be contacted shortly by one of our operators" : "Richiesta di contatto registrata con successo, a breve verrà contattato da uno dei nostri operatori"
          );
          // Reset form
          setFormData({
            email: "",
            name: "",
            surname: "",
            business_name: "",
            request: "",
            description: "",
          });
          setHCaptchaToken(null);
          captchaRef.current?.resetCaptcha();
        } else {
          toast(data.message || (isEnglish ? "Error sending request" : "Errore nell'invio della richiesta"));
        }
      })
      .catch((error) => {
        toast(isEnglish ? "Error sending request" : "Errore nell'invio della richiesta");
      });
  }

  return (
    <Dialog>
      <div className="grid lg:grid-cols-2 bg-muted">
        <div
          className="bg-no-repeat bg-cover hidden lg:block"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: "-15% 30%",
          }}></div>
        <div className="flex flex-col px-8 py-16 gap-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <div className="lg:w-1/2">
            {description && <PortableTextRenderer value={description} />}
          </div>
          <DialogTrigger asChild className="lg:w-1/3">
            <Button>{button_text}</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEnglish ? "Contact Us" : "Contattaci"}</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="name">{isEnglish ? "First Name" : "Nome"}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="surname">{isEnglish ? "Last Name" : "Cognome"}</Label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData({ ...formData, surname: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="business_name">{isEnglish ? "Company" : "Azienda"}</Label>
                <Input
                  id="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="request">{isEnglish ? "Request" : "Richiesta"}</Label>
                <Input
                  id="request"
                  type="text"
                  value={formData.request}
                  onChange={(e) =>
                    setFormData({ ...formData, request: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">{isEnglish ? "Description" : "Descrizione"}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={(token) => setHCaptchaToken(token)}
                  onExpire={() => setHCaptchaToken(null)}
                />
                <p className="text-xs my-2">
                  {isEnglish
                    ? 'By clicking "Submit" you acknowledge that you have read the privacy policy.'
                    : 'Cliccando "Invia" si dichiara di aver preso visione dell’informativa per il trattamento dei dati personali.'}
                </p>
              </div>

              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={handleSubmit}
                disabled={!hCaptchaToken}
              >
                {isEnglish ? "Submit" : "Invia"}
              </Button>
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {isEnglish ? "Close" : "Chiudi"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </div>
      </div>
    </Dialog>
  );
}
export default ContactForm;
