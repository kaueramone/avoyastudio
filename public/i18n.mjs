import { privacyTranslations } from './locale-privacy.mjs';
import { copyTranslations } from './locale-copy.mjs';
import { selectedCurrency } from './commerce.mjs';
let saved;try{saved=localStorage.getItem('avoya-language');}catch{}
export const language=globalThis.location?.pathname?.endsWith('/admin.html')?'pt':['pt','en','es'].includes(new URLSearchParams(globalThis.location?.search).get('lang'))?new URLSearchParams(location.search).get('lang'):['pt','en','es'].includes(saved)?saved:'pt';
try{if(globalThis.location?.search&&['pt','en','es'].includes(new URLSearchParams(location.search).get('lang')))localStorage.setItem('avoya-language',language);}catch{}
if(globalThis.document)document.documentElement.lang=language==='pt'?'pt-PT':language;
const translations=new Map([...copyTranslations,...privacyTranslations]);
// Explicit, reviewed translations. User names, emails and form values are never translated.
const rows=`
Ainda há espaço|There is still room|Todavía hay espacio
para um novo ritual.|for a new ritual.|para un nuevo ritual.
Descobre a coleção e guarda aqui as tuas velas favoritas.|Explore the collection and save your favourite candles here.|Descubre la colección y guarda aquí tus velas favoritas.
Explorar a coleção ↗|Explore the collection ↗|Explorar la colección ↗
Remover|Remove|Eliminar
Quantidade|Quantity|Cantidad
Subtotal ilustrativo|Illustrative subtotal|Subtotal ilustrativo
Esta seleção fica guardada no teu navegador. Não cria uma encomenda nem reserva produtos.|This selection is saved in your browser. It does not create an order or reserve products.|Esta selección se guarda en tu navegador. No crea un pedido ni reserva productos.
Rever a seleção ↗|Review selection ↗|Revisar la selección ↗
Falar sobre esta seleção ↗|Ask about this selection ↗|Consultar esta selección ↗
Ainda não encontrámos esse aroma. Experimenta “chá”, “âmbar” ou “Raiz”.|We have not found that scent. Try “tea”, “amber” or “Raiz”.|No hemos encontrado ese aroma. Prueba “té”, “ámbar” o “Raiz”.
A coleção está a ser preparada. Volta em breve para descobrir as novidades.|The collection is being prepared. Come back soon to discover what is new.|Estamos preparando la colección. Vuelve pronto para descubrir las novedades.
A coleção está temporariamente indisponível. Tenta novamente dentro de instantes.|The collection is temporarily unavailable. Please try again shortly.|La colección no está disponible temporalmente. Inténtalo de nuevo en unos instantes.
Abrir menu|Open menu|Abrir menú
Fechar menu|Close menu|Cerrar menú
Navegação principal|Main navigation|Navegación principal
Ordenar produtos|Sort products|Ordenar productos
Filtrar por família de aroma|Filter by scent family|Filtrar por familia de aromas
A aguardar pagamento|Awaiting payment|Pendiente de pago
Em processamento|Processing|En proceso
Confirmada|Confirmed|Confirmado
Em preparação|Being prepared|En preparación
Enviada|Shipped|Enviado
Entregue|Delivered|Entregado
Cancelada|Cancelled|Cancelado
Por pagar|Unpaid|Sin pagar
Pago|Paid|Pagado
Falhou|Failed|Fallido
Parcialmente reembolsado|Partially refunded|Reembolsado parcialmente
Reembolsado|Refunded|Reembolsado
O email ou a palavra-passe não estão corretos.|The email or password is incorrect.|El email o la contraseña no son correctos.
Confirma o teu email antes de entrar. Abre a mensagem de confirmação recebida.|Confirm your email before signing in. Open the confirmation email you received.|Confirma tu email antes de entrar. Abre el mensaje de confirmación recibido.
Os novos registos ainda estão a ser preparados. Volta em breve.|New registrations are still being prepared. Please return soon.|Estamos preparando los nuevos registros. Vuelve pronto.
Escolhe uma palavra-passe mais forte, com pelo menos 12 caracteres.|Choose a stronger password with at least 12 characters.|Elige una contraseña más segura, con al menos 12 caracteres.
Escolhe uma palavra-passe diferente da atual.|Choose a password different from your current one.|Elige una contraseña diferente de la actual.
A verificação de segurança expirou. Aguarda a nova verificação e tenta novamente.|The security check expired. Wait for a new check and try again.|La verificación de seguridad ha caducado. Espera una nueva verificación e inténtalo de nuevo.
O envio de email atingiu o limite temporário. Tenta mais tarde.|The temporary email limit has been reached. Try again later.|Se ha alcanzado el límite temporal de emails. Inténtalo más tarde.
Foram feitas demasiadas tentativas. Aguarda um pouco e tenta novamente.|Too many attempts. Wait a little and try again.|Demasiados intentos. Espera un poco e inténtalo de nuevo.
A sessão terminou. Entra novamente para continuar.|Your session has ended. Sign in again to continue.|Tu sesión ha terminado. Vuelve a entrar para continuar.
Aguarda a verificação de segurança.|Wait for the security check.|Espera la verificación de seguridad.
Se a conta puder ser criada, receberás um email de confirmação. Confirma o endereço e entra com a tua palavra-passe.|If the account can be created, you will receive a confirmation email. Confirm your address and sign in with your password.|Si la cuenta puede crearse, recibirás un email de confirmación. Confirma la dirección y entra con tu contraseña.
Se existir uma conta com este email, receberás as instruções de recuperação.|If an account exists with this email, you will receive recovery instructions.|Si existe una cuenta con este email, recibirás instrucciones de recuperación.
Os teus dados foram guardados.|Your details have been saved.|Tus datos se han guardado.
. As compras reais ainda não estão abertas.|. Real purchases are not open yet.|. Las compras reales aún no están abiertas.
Saltar para o conteúdo|Skip to content|Saltar al contenido
A coleção|The collection|La colección
A artesã|The maker|La artesana
O ritual|The ritual|El ritual
A minha conta|My account|Mi cuenta
Pesquisar velas|Search candles|Buscar velas
Saco|Bag|Bolsa
O primeiro capítulo da Avoya · Pré-lançamento|Avoya's first chapter · Coming soon|El primer capítulo de Avoya · Próximamente
Feito com tempo. Sentido com calma.|Made slowly. Felt deeply.|Hecho con tiempo. Sentido con calma.
Pequenos rituais.|Small rituals.|Pequeños rituales.
Novos sentidos.|New sensations.|Nuevas sensaciones.
Velas que guardam lugares, despertam memórias e tornam o quotidiano um pouco mais nosso.|Candles that hold places, awaken memories and make everyday life feel a little more our own.|Velas que guardan lugares, despiertan recuerdos y hacen que lo cotidiano sea un poco más nuestro.
Descobrir a coleção|Explore the collection|Descubrir la colección
Raízes brasileiras.|Brazilian roots.|Raíces brasileñas.
Uma nova luz em Portugal.|A new light in Portugal.|Una nueva luz en Portugal.
O primeiro capítulo|The first chapter|El primer capítulo
O início de algo especial.|The start of something special.|El comienzo de algo especial.
Uma história em cada aroma|A story in every scent|Una historia en cada aroma
O cuidado de criar à mão|The care of making by hand|El cuidado de crear a mano
O prazer de estar presente|The pleasure of being present|El placer de estar presente
A primeira coleção|The first collection|La primera colección
Encontra o teu ritual.|Find your ritual.|Encuentra tu ritual.
Quatro formas de viajar|Four ways to travel|Cuatro formas de viajar
sem sair do teu lugar.|without leaving home.|sin salir de casa.
Coleção de apresentação. Imagens, aromas, pesos e preços ilustrativos.|Preview collection. Images, scents, weights and prices are illustrative.|Colección de presentación. Imágenes, aromas, pesos y precios ilustrativos.
Todas|All|Todas
Frescas|Fresh|Frescas
Amadeiradas|Woody|Amaderadas
Florais|Floral|Florales
Ordenar|Sort|Ordenar
Seleção Avoya|Avoya selection|Selección Avoya
Preço crescente|Price: low to high|Precio: de menor a mayor
Preço decrescente|Price: high to low|Precio: de mayor a menor
Serenidade|Serenity|Serenidad
Aconchego|Warmth|Calidez
Pertença|Belonging|Pertenencia
Leveza|Lightness|Ligereza
Chá verde · figueira · cedro|Green tea · fig tree · cedar|Té verde · higuera · cedro
Flor de laranjeira · âmbar · sândalo|Orange blossom · amber · sandalwood|Azahar · ámbar · sándalo
Jasmim · coco · madeiras suaves|Jasmine · coconut · soft woods|Jazmín · coco · maderas suaves
Sal marinho · bergamota · almíscar|Sea salt · bergamot · musk|Sal marina · bergamota · almizcle
Uma pausa em tons de verde|A pause in shades of green|Una pausa en tonos de verde
O calor de um lugar que fica|The warmth of a place that stays|La calidez de un lugar que permanece
Um encontro com o que é nosso|A meeting with our roots|Un encuentro con nuestras raíces
O espaço entre dois pensamentos|The space between two thoughts|El espacio entre dos pensamientos
O gesto antes da luz.|The gesture before the light.|El gesto antes de la luz.
A artesã · Simone Martins|The maker · Simone Martins|La artesana · Simone Martins
De tantos lugares,|From so many places,|De tantos lugares,
um caminho|a path|un camino
feito à mão.|made by hand.|hecho a mano.
Do Brasil trouxe as raízes. Das viagens pela Europa e por África, um olhar atento às cores, aos aromas e às pequenas coisas que ficam.|From Brazil, she brought her roots. From travels through Europe and Africa, an eye for colours, scents and the little things that stay with us.|De Brasil trajo sus raíces. De los viajes por Europa y África, una mirada atenta a los colores, los aromas y las pequeñas cosas que permanecen.
Em Portugal, encontrou espaço para escutar uma nova vontade: criar com as mãos. A Avoya nasceu desse encontro entre descoberta, coragem e cuidado.|In Portugal, she found space to listen to a new calling: to create with her hands. Avoya grew from this meeting of discovery, courage and care.|En Portugal encontró espacio para escuchar un nuevo deseo: crear con las manos. Avoya nació de ese encuentro entre descubrimiento, valentía y cuidado.
Conhecer a Simone|Meet Simone|Conocer a Simone
A beleza de estar aqui|The beauty of being here|La belleza de estar aquí
Acender uma vela.|Light a candle.|Encender una vela.
Dar tempo ao momento.|Give the moment time.|Dar tiempo al momento.
Um livro aberto. Uma conversa que se prolonga. A casa em silêncio. Acreditamos nos objetos que acompanham a vida com delicadeza.|An open book. A conversation that lingers. A quiet home. We believe in objects that accompany life gently.|Un libro abierto. Una conversación que se alarga. La casa en silencio. Creemos en los objetos que acompañan la vida con delicadeza.
É nesse espaço simples, entre o que sentimos e o que escolhemos cuidar, que a Avoya quer estar.|In that simple space, between what we feel and what we choose to care for, is where Avoya belongs.|Es en ese espacio sencillo, entre lo que sentimos y lo que elegimos cuidar, donde Avoya quiere estar.
O teu ritual, com cuidado|Your ritual, with care|Tu ritual, con cuidado
O primeiro capítulo está a nascer|The first chapter is taking shape|El primer capítulo está naciendo
Vamos conversar?|Let's talk.|¿Hablamos?
Histórias do mundo.|Stories from the world.|Historias del mundo.
Feito com cuidado, em Portugal.|Made with care, in Portugal.|Hecho con cuidado, en Portugal.
O universo Avoya|The Avoya world|El universo Avoya
O ritual e os cuidados|The ritual and candle care|El ritual y sus cuidados
Privacidade|Privacy|Privacidad
Estamos por aqui|Find us here|Estamos por aquí
Redes sociais em breve|Social accounts coming soon|Redes sociales próximamente
Informações sobre esta loja|About this shop|Información sobre esta tienda
Fechar|Close|Cerrar
Um ritual à tua medida|A ritual of your own|Un ritual a tu medida
O teu saco.|Your bag.|Tu bolsa.
Encontra o teu próximo ritual|Find your next ritual|Encuentra tu próximo ritual
O que procuras?|What are you looking for?|¿Qué buscas?
Pesquisar por nome ou aroma|Search by name or scent|Buscar por nombre o aroma
Nome, aroma ou sensação…|Name, scent or feeling…|Nombre, aroma o sensación…
Uma loja a ganhar forma|A shop taking shape|Una tienda que toma forma
O primeiro capítulo.|The first chapter.|El primer capítulo.
Falar com a Avoya ↗|Contact Avoya ↗|Hablar con Avoya ↗
Adicionar ao saco|Add to bag|Añadir a la bolsa
Notas imaginadas|Imagined scent notes|Notas imaginadas
Conhecer os cuidados ↗|Candle care ↗|Conocer los cuidados ↗
Continuar a explorar|Keep exploring|Seguir explorando
Entrega|Delivery|Envío
Subtotal|Subtotal|Subtotal
Total|Total|Total
Mais perto de ti.|Closer to you.|Más cerca de ti.
Revê a tua seleção. Estamos a preparar as primeiras compras da Avoya.|Review your selection. We are preparing Avoya's first orders.|Revisa tu selección. Estamos preparando las primeras compras de Avoya.
A preparar o teu saco…|Preparing your bag…|Preparando tu bolsa…
A tua seleção.|Your selection.|Tu selección.
País de entrega|Delivery country|País de entrega
Tudo no teu espaço.|All in your space.|Todo en tu espacio.
A tua próxima história.|Your next story.|Tu próxima historia.
Entrar ou criar conta ↗|Sign in or create an account ↗|Entrar o crear cuenta ↗
Abrir pagamento de teste ↗|Open test checkout ↗|Abrir pago de prueba ↗
Continuar para pagamento ↗|Continue to payment ↗|Continuar al pago ↗
Compras disponíveis em breve|Shopping coming soon|Compras próximamente
O teu universo Avoya|Your Avoya world|Tu universo Avoya
A tua conta.|Your account.|Tu cuenta.
Os teus dados e a história de cada encomenda, num só lugar.|Your details and every order's story, in one place.|Tus datos y la historia de cada pedido, en un solo lugar.
A preparar o teu espaço…|Preparing your space…|Preparando tu espacio…
Entrar|Sign in|Entrar
Criar conta|Create account|Crear cuenta
Recuperar acesso|Recover access|Recuperar acceso
Começa uma nova história.|Begin a new story.|Empieza una nueva historia.
Que bom ter-te por aqui.|Lovely to have you here.|Qué alegría tenerte aquí.
O teu nome|Your name|Tu nombre
Email|Email|Email
Palavra-passe|Password|Contraseña
Mostrar palavra-passe|Show password|Mostrar contraseña
Ocultar palavra-passe|Hide password|Ocultar contraseña
Pelo menos 12 caracteres. Usa uma palavra-passe exclusiva para a Avoya.|At least 12 characters. Use a unique password for Avoya.|Al menos 12 caracteres. Usa una contraseña exclusiva para Avoya.
Li a|I have read the|He leído la
informação sobre privacidade|privacy information|información sobre privacidad
. A criação de conta não subscreve comunicações de marketing.|. Creating an account does not subscribe you to marketing.|. Crear una cuenta no te suscribe a comunicaciones de marketing.
Enviamos um email para definires uma nova palavra-passe. O acesso habitual continua a ser por email e palavra-passe.|We will email you instructions to set a new password. You will normally sign in with email and password.|Te enviaremos un email para definir una nueva contraseña. El acceso habitual sigue siendo por email y contraseña.
Enviar instruções|Send instructions|Enviar instrucciones
Criar a minha conta|Create my account|Crear mi cuenta
A preparar o acesso seguro…|Preparing secure access…|Preparando el acceso seguro…
Esqueci-me da palavra-passe|Forgot your password?|He olvidado mi contraseña
Voltar ao início de sessão|Back to sign in|Volver al inicio de sesión
Um espaço para|A space for|Un espacio para
os teus pequenos rituais.|your small rituals.|tus pequeños rituales.
Segurança da conta.|Account security.|Seguridad de la cuenta.
Define a nova palavra-passe.|Set your new password.|Define tu nueva contraseña.
A palavra-passe fica protegida pelo serviço de autenticação. Não a partilhes com ninguém.|Your password is protected by the authentication service. Do not share it with anyone.|Tu contraseña está protegida por el servicio de autenticación. No la compartas con nadie.
Nova palavra-passe|New password|Nueva contraseña
Repetir palavra-passe|Repeat password|Repetir contraseña
Pelo menos 12 caracteres. Usa uma palavra-passe exclusiva.|At least 12 characters. Use a unique password.|Al menos 12 caracteres. Usa una contraseña exclusiva.
Guardar palavra-passe|Save password|Guardar contraseña
Encomendas|Orders|Pedidos
Os meus dados|My details|Mis datos
Segurança|Security|Seguridad
Terminar sessão ↗|Sign out ↗|Cerrar sesión ↗
Os meus dados.|My details.|Mis datos.
Nome|Name|Nombre
Telemóvel|Phone|Teléfono
(opcional)|(optional)|(opcional)
Guardar dados|Save details|Guardar datos
Os teus dados, com cuidado.|Your details, with care.|Tus datos, con cuidado.
Privacidade ↗|Privacy ↗|Privacidad ↗
A tua história começa aqui.|Your story starts here.|Tu historia empieza aquí.
Ainda não tens encomendas. Quando fizeres a primeira compra, os detalhes e o acompanhamento ficam guardados neste espaço.|You have no orders yet. After your first purchase, its details and tracking will be saved here.|Todavía no tienes pedidos. Tras tu primera compra, los detalles y el seguimiento quedarán guardados aquí.
Encomenda de teste · sem cobrança real|Test order · no real charge|Pedido de prueba · sin cobro real
A carregar…|Loading…|Cargando…
A entrar…|Signing in…|Entrando…
A enviar…|Sending…|Enviando…
As palavras-passe não coincidem.|The passwords do not match.|Las contraseñas no coinciden.
Palavra-passe guardada. Já podes usá-la para entrar.|Password saved. You can now use it to sign in.|Contraseña guardada. Ya puedes usarla para entrar.
O ritual, com cuidado|The ritual, with care|El ritual, con cuidado
Pequenos gestos.|Small gestures.|Pequeños gestos.
Um momento melhor.|A better moment.|Un momento mejor.
O cuidado também faz parte da experiência. Acompanha sempre as instruções específicas que vierem com a tua vela.|Care is part of the experience. Always follow the specific instructions supplied with your candle.|El cuidado también forma parte de la experiencia. Sigue siempre las instrucciones específicas de tu vela.
Escolhe o teu lugar.|Choose your place.|Elige tu lugar.
Uma superfície estável e resistente ao calor, longe de correntes de ar e de materiais inflamáveis. Mantém a vela fora do alcance de crianças e animais.|Choose a stable, heat-resistant surface, away from draughts and flammable materials. Keep the candle out of reach of children and pets.|Elige una superficie estable y resistente al calor, lejos de corrientes de aire y materiales inflamables. Mantén la vela fuera del alcance de niños y animales.
Fica presente.|Stay present.|Permanece presente.
Nunca deixes uma vela acesa sem vigilância. Apaga-a antes de sair do espaço ou de adormecer.|Never leave a burning candle unattended. Extinguish it before leaving the room or going to sleep.|Nunca dejes una vela encendida sin vigilancia. Apágala antes de salir o de dormirte.
Respeita o tempo.|Respect the time.|Respeta el tiempo.
Segue o tempo de utilização indicado no rótulo do produto. Deixa o recipiente arrefecer completamente antes de lhe tocar ou o deslocar.|Follow the burning time stated on the product label. Let the container cool completely before touching or moving it.|Respeta el tiempo de uso indicado en la etiqueta. Deja enfriar completamente el recipiente antes de tocarlo o moverlo.
Fala connosco.|Talk to us.|Habla con nosotros.
As instruções específicas de cada modelo serão disponibilizadas com a coleção final. Para esclarecer dúvidas, escreve para|Specific instructions for each model will accompany the final collection. For questions, write to|Las instrucciones específicas de cada modelo estarán disponibles con la colección final. Si tienes dudas, escribe a
A mulher por trás do gesto|The woman behind the gesture|La mujer detrás del gesto
Criar também é|Creating is also|Crear también es
uma forma de|a way of|una forma de
nos encontrarmos.|finding ourselves.|encontrarnos.
Brasil, 1991 · Portugal, desde 2023|Brazil, 1991 · Portugal, since 2023|Brasil, 1991 · Portugal, desde 2023
A Avoya começa muito antes da primeira vela. Começa numa mulher que aprendeu a olhar para os recomeços como um lugar de possibilidade.|Avoya begins long before the first candle. It begins with a woman who learned to see new beginnings as a place of possibility.|Avoya comienza mucho antes de la primera vela. Comienza con una mujer que aprendió a ver los nuevos comienzos como un lugar de posibilidades.
Mãos que criam.|Hands that create.|Manos que crean.
Um caminho que se revela.|A path unfolding.|Un camino que se revela.
Uma imagem do universo artesanal.|An image of the craft world.|Una imagen del universo artesanal.
O retrato da Simone chega em breve.|Simone's portrait is coming soon.|El retrato de Simone llegará pronto.
Raízes, caminhos e uma nova luz|Roots, paths and a new light|Raíces, caminos y una nueva luz
O que trazemos.|What we bring.|Lo que traemos.
O que descobrimos.|What we discover.|Lo que descubrimos.
O que criamos.|What we create.|Lo que creamos.
Porque há coisas que criamos para a casa.|Some things we create for the home.|Porque hay cosas que creamos para la casa.
E outras que acabam por nos fazer sentir em casa.|Others end up making us feel at home.|Y otras que acaban haciéndonos sentir en casa.
Descobrir o universo Avoya|Explore the Avoya world|Descubrir el universo Avoya
01 / Origem|01 / Origins|01 / Origen
Brasil|Brazil|Brasil
As raízes, o afeto e a vontade de criar algo com significado.|Roots, affection and the desire to create something meaningful.|Las raíces, el cariño y el deseo de crear algo con significado.
02 / Descoberta|02 / Discovery|02 / Descubrimiento
O mundo|The world|El mundo
Viagens pela Europa e por África. Lugares que se tornam sensações.|Travels through Europe and Africa. Places that become sensations.|Viajes por Europa y África. Lugares que se convierten en sensaciones.
03 / Recomeço|03 / New beginnings|03 / Nuevo comienzo
Desde 2023, um novo capítulo. Hoje, o lugar onde a Avoya ganha forma.|A new chapter since 2023. Today, the place where Avoya takes shape.|Desde 2023, un nuevo capítulo. Hoy, el lugar donde Avoya toma forma.

A tua seleção está vazia.|Your bag is empty.|Tu bolsa está vacía.
O teu saco está à espera.|Your bag is waiting.|Tu bolsa está esperando.
Escolhe as tuas próximas velas para continuar.|Choose your next candles to continue.|Elige tus próximas velas para continuar.
Esta seleção ultrapassa o limite: contacta o estúdio para um orçamento de envio.|This selection exceeds the weight limit: contact the studio for a shipping quote.|Esta selección supera el límite de peso: contacta con el estudio para un presupuesto de envío.
Podem aplicar-se impostos de importação e encargos de desalfandegamento no destino, não incluídos neste total.|Import taxes and customs clearance charges may apply at destination and are not included in this total.|Pueden aplicarse impuestos de importación y gastos de aduana en destino, no incluidos en este total.
Modo de teste. Os produtos são ilustrativos. Usa apenas dados de pagamento de teste; não é uma compra real.|Test mode. Products are illustrative. Use test payment details only; this is not a real purchase.|Modo de prueba. Los productos son ilustrativos. Usa solo datos de pago de prueba; no es una compra real.
A morada de entrega e os dados de pagamento são introduzidos no checkout seguro da Stripe.|Enter your delivery address and payment details in Stripe's secure checkout.|La dirección de entrega y los datos de pago se introducen en el pago seguro de Stripe.
As compras online ainda não estão disponíveis. Estamos a preparar os produtos finais, os envios e os pagamentos. Esta seleção não cria uma encomenda nem reserva produtos.|Online shopping is not yet available. We are preparing the final products, shipping and payments. This selection does not create an order or reserve products.|Las compras online aún no están disponibles. Estamos preparando los productos finales, los envíos y los pagos. Esta selección no crea un pedido ni reserva productos.
Entra ou cria uma conta para guardar o histórico das tuas futuras encomendas.|Sign in or create an account to keep your future order history.|Entra o crea una cuenta para guardar el historial de tus futuros pedidos.
Acompanha as tuas encomendas e mantém os teus dados num só lugar. Estamos a preparar o primeiro capítulo da loja: os produtos continuam ilustrativos e os pagamentos reais ainda não estão ativos.|Track your orders and keep your details in one place. We are preparing the shop's first chapter: products remain illustrative and real payments are not yet active.|Sigue tus pedidos y guarda tus datos en un solo lugar. Estamos preparando el primer capítulo de la tienda: los productos siguen siendo ilustrativos y los pagos reales aún no están activos.
A morada de entrega será pedida no pagamento, quando as compras estiverem disponíveis. A tua conta não está inscrita em marketing.|Your delivery address will be requested at checkout once shopping is available. Your account is not subscribed to marketing.|La dirección de entrega se pedirá en el pago cuando las compras estén disponibles. Tu cuenta no está suscrita a marketing.
Produto de demonstração. Imagem, aroma, peso e preço ilustrativos. As vendas ainda não estão abertas.|Demonstration product. Image, scent, weight and price are illustrative. Sales are not open yet.|Producto de demostración. Imagen, aroma, peso y precio ilustrativos. Las ventas aún no están abiertas.
Entra para consultar a encomenda.|Sign in to view your order.|Entra para consultar el pedido.
O resultado do pagamento é confirmado de forma segura no histórico da tua conta.|The payment result is securely confirmed in your account's order history.|El resultado del pago se confirma de forma segura en el historial de tu cuenta.
Entrar na minha conta ↗|Sign in to my account ↗|Entrar en mi cuenta ↗
As minhas encomendas ↗|My orders ↗|Mis pedidos ↗
Obrigada por fazeres parte.|Thank you for being part of our story.|Gracias por formar parte.
O pagamento foi interrompido.|Payment was interrupted.|El pago se ha interrumpido.
A confirmar o teu pagamento.|Confirming your payment.|Confirmando tu pago.
O pagamento de teste foi confirmado. Não foi cobrado dinheiro real.|Test payment confirmed. No real money was charged.|Pago de prueba confirmado. No se ha cobrado dinero real.
O pagamento foi confirmado. Podes acompanhar a encomenda na tua conta.|Payment confirmed. You can track your order in your account.|Pago confirmado. Puedes seguir el pedido en tu cuenta.
Voltaste à loja sem concluir este pagamento. Podes verificar o estado nas tuas encomendas.|You returned to the shop without completing payment. Check its status in your orders.|Has vuelto a la tienda sin completar el pago. Puedes consultar su estado en tus pedidos.
O serviço de pagamentos ainda não confirmou a compra. Esta página, por si só, não confirma um pagamento.|The payment provider has not confirmed the purchase yet. This page alone does not confirm a payment.|El proveedor de pagos aún no ha confirmado la compra. Esta página por sí sola no confirma un pago.
O estado apresentado vem do registo privado da tua encomenda.|This status comes from your private order record.|Este estado procede del registro privado de tu pedido.
A preparar o pagamento seguro…|Preparing secure payment…|Preparando el pago seguro…
Com cuidado, também nos dados|Care for your data, too|Cuidamos también tus datos
A tua privacidade.|Your privacy.|Tu privacidad.
A tua conta|Your account|Tu cuenta
Encomendas e pagamentos|Orders and payments|Pedidos y pagos
Segurança e armazenamento no navegador|Security and browser storage|Seguridad y almacenamiento en el navegador
Conservação e direitos|Retention and your rights|Conservación y derechos
Informação atualizada em 9 de novembro de 2026.|Information updated on 9 November 2026.|Información actualizada el 9 de noviembre de 2026.
Podes também apresentar uma reclamação à|You can also submit a complaint to the|También puedes presentar una reclamación ante la
Comissão Nacional de Proteção de Dados|Portuguese Data Protection Authority|Comisión Nacional de Protección de Datos de Portugal
`;
for(const row of rows.trim().split('\n')){const [pt,en,es]=row.split('|');translations.set(pt,{en,es});}
export function t(value){const key=String(value).trim();const found=translations.get(key)?.[language];if(found)return String(value).replace(key,found);if(key.endsWith('↗')){const base=key.slice(0,-1).trim(),label=translations.get(base)?.[language];if(label)return String(value).replace(key,`${label} ↗`);}if(language!=='pt'){
 const patterns=[[/^Ver (.+)$/,'View $1','Ver $1'],[/^Adicionar (.+) ao saco$/,'Add $1 to bag','Añadir $1 a la bolsa'],[/^Diminuir quantidade de (.+)$/,'Decrease quantity of $1','Reducir cantidad de $1'],[/^Aumentar quantidade de (.+)$/,'Increase quantity of $1','Aumentar cantidad de $1'],[/^Remover (.+)$/,'Remove $1','Eliminar $1'],[/^Imagem ilustrativa da vela (.+)$/,'Illustrative image of $1 candle','Imagen ilustrativa de la vela $1'],[/^A primeira coleção · (.+)$/,'The first collection · $1','La primera colección · $1'],[/^Envio manual pelos CTT, a partir de (.+)\. Tarifa para encomendas até ([0-9.]+) kg\. ?(.*)$/,'Manual CTT dispatch from $1. Rate for orders up to $2 kg. $3','Envío manual por CTT desde $1. Tarifa para pedidos de hasta $2 kg. $3'],[/^A comprar com (.+)\. As encomendas ficam guardadas na tua conta\.$/,'Shopping as $1. Orders are saved in your account.','Comprando con $1. Los pedidos se guardan en tu cuenta.'],[/^Vela artesanal · (.+)$/,'Handmade candle · $1','Vela artesanal · $1'],[/^(\d+) velas nesta seleção$/,'$1 candles in this selection','$1 velas en esta selección'],[/^Abrir saco, (\d+) artigos?$/,'Open bag, $1 items','Abrir bolsa, $1 artículos'],[/^(.+) adicionado ao saco\.$/,'$1 added to your bag.','$1 añadido a la bolsa.']];
 for(const [pattern,en,es] of patterns)if(pattern.test(key))return key.replace(pattern,language==='en'?en:es);
 }return value;}
let queued=false;
function translate(){queued=false;if(language==='pt')return;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement.closest('script,style,textarea,input,[translate="no"],#locale-controls'))continue;const value=t(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}for(const el of document.querySelectorAll('[aria-label],[placeholder],[alt]'))for(const attr of ['aria-label','placeholder','alt']){const value=el.getAttribute(attr);if(value&&t(value)!==value)el.setAttribute(attr,t(value));}}
export function mountLocaleControls(){
 const target=document.querySelector('#locale-controls');if(target){target.innerHTML=`<label><span>${language==='en'?'Language':language==='es'?'Idioma':'Idioma'}</span><select id="shop-language" aria-label="${language==='en'?'Language':'Idioma'}">${['pt','en','es'].map(l=>`<option value="${l}" ${language===l?'selected':''}>${l.toUpperCase()}</option>`).join('')}</select></label><label><span>${language==='en'?'Currency':language==='es'?'Moneda':'Moeda'}</span><select id="shop-currency" aria-label="${language==='en'?'Currency':language==='es'?'Moneda':'Moeda'}"><option value="EUR" ${selectedCurrency()==='EUR'?'selected':''}>EUR €</option><option value="BRL" ${selectedCurrency()==='BRL'?'selected':''}>BRL R$</option></select></label>`;
 target.querySelector('#shop-language').addEventListener('change',event=>{try{localStorage.setItem('avoya-language',event.target.value);}catch{}const url=new URL(location.href);url.searchParams.set('lang',event.target.value);location.assign(url.href);});
 target.querySelector('#shop-currency').addEventListener('change',event=>{try{localStorage.setItem('avoya-currency',event.target.value);}catch{}location.reload();});}
 translate();new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(translate);}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','alt']});
}
