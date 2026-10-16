from typing import Annotated

from pydantic import StringConstraints

# Correo con validación de formato simple (EmailStr rechaza dominios como .local usados en pruebas)
Correo = Annotated[str, StringConstraints(strip_whitespace=True, to_lower=True, max_length=150,
                                          pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
