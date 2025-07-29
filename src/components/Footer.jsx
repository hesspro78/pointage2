import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';

const Footer = () => {
  const whatsappLink = "https://wa.me/212613805503?text=Bonjour%20Taoufik%2C%20j'ai%20une%20question%20concernant%20l'application%20de%20pointage.";

  return (
    <footer className="glass-effect border-t border-white/10 p-8 mt-12 text-center text-gray-400">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold gradient-text mb-4">Contactez-nous</h2>
        <p className="mb-6">
          Nous sommes ravis de vous offrir une ligne directe pour nous faire part de vos pensées. 
          Que ce soit une suggestion inspirante, une question pertinente ou le signalement d'un bug inattendu, 
          votre retour est précieux.
        </p>
        <p className="mb-2">Pour une assistance rapide ou partager vos idées, veuillez nous contacter via WhatsApp :</p>
        <p className="text-lg text-white font-medium mb-6">Taoufik Jadi: <a href="tel:+212613805503" className="hover:text-blue-400 transition-colors duration-300 flex items-center justify-center gap-2"><Phone size={18}/>+212 613805503</a></p>
        
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button 
            variant="outline" 
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 border-green-600 hover:border-green-700"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contacter sur WhatsApp
          </Button>
        </a>
        <p className="mt-8 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Système de Pointage. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;