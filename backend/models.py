"""Modelos ORM. El esquema lo crea database/sgts_db_postgresql.sql (no se usa create_all)."""
from datetime import date, datetime

from sqlalchemy import (Boolean, Column, Computed, Date, DateTime, ForeignKey, Integer,
                        SmallInteger, String, Table, Text)
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

RolEnum = PGEnum("usuario", "tecnico", "administrador", name="rol_empleado", create_type=False)
PrioridadEnum = PGEnum("Crítica", "Alta", "Media", "Baja", name="prioridad_ticket", create_type=False)
EstadoEnum = PGEnum("Abierto", "En proceso", "Resuelto", "Cerrado", name="estado_ticket", create_type=False)

ticket_equipo = Table(
    "ticket_equipo", Base.metadata,
    Column("id_ticket", ForeignKey("ticket.id_ticket"), primary_key=True),
    Column("id_equipo", ForeignKey("equipo.id_equipo"), primary_key=True),
)


class Departamento(Base):
    __tablename__ = "departamento"
    id_departamento: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(Text)


class SLA(Base):
    __tablename__ = "sla"
    id_sla: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    prioridad: Mapped[str] = mapped_column(PrioridadEnum)
    tiempo_respuesta: Mapped[int] = mapped_column(Integer)  # minutos
    tiempo_solucion: Mapped[int] = mapped_column(Integer)   # minutos
    descripcion: Mapped[str | None] = mapped_column(Text)


class Categoria(Base):
    __tablename__ = "categoria"
    id_categoria: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str | None] = mapped_column(Text)


class Empleado(Base):
    __tablename__ = "empleado"
    id_empleado: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    apellido: Mapped[str] = mapped_column(String(100))
    correo: Mapped[str] = mapped_column(String(150), unique=True)
    telefono: Mapped[str | None] = mapped_column(String(20))
    cargo: Mapped[str | None] = mapped_column(String(100))
    rol: Mapped[str] = mapped_column(RolEnum, default="usuario")
    contrasena: Mapped[str] = mapped_column(String(255))
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    id_departamento: Mapped[int] = mapped_column(ForeignKey("departamento.id_departamento"))

    departamento: Mapped[Departamento] = relationship()
    tecnico_detalle: Mapped["TecnicoDetalle | None"] = relationship(
        uselist=False, cascade="all, delete-orphan")

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombre} {self.apellido}"


class TecnicoDetalle(Base):
    __tablename__ = "tecnico_detalle"
    id_empleado: Mapped[int] = mapped_column(ForeignKey("empleado.id_empleado"), primary_key=True)
    especialidad: Mapped[str] = mapped_column(String(100))


class CodigoRecuperacion(Base):
    __tablename__ = "codigo_recuperacion"
    id_codigo: Mapped[int] = mapped_column(primary_key=True)
    id_empleado: Mapped[int] = mapped_column(ForeignKey("empleado.id_empleado"))
    codigo_hash: Mapped[str] = mapped_column(String(255))
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    expira_en: Mapped[datetime] = mapped_column(DateTime)
    usado: Mapped[bool] = mapped_column(Boolean, default=False)
    intentos: Mapped[int] = mapped_column(SmallInteger, default=0)


class Equipo(Base):
    __tablename__ = "equipo"
    id_equipo: Mapped[int] = mapped_column(primary_key=True)
    codigo_inventario: Mapped[str] = mapped_column(String(50))
    nombre_equipo: Mapped[str | None] = mapped_column(String(100))
    marca: Mapped[str | None] = mapped_column(String(100))
    modelo: Mapped[str | None] = mapped_column(String(100))
    serial: Mapped[str | None] = mapped_column(String(100))
    estado: Mapped[str | None] = mapped_column(String(50))
    fecha_adquisicion: Mapped[date | None] = mapped_column(Date)
    id_departamento: Mapped[int] = mapped_column(ForeignKey("departamento.id_departamento"))

    departamento: Mapped[Departamento] = relationship()


class Ticket(Base):
    __tablename__ = "ticket"
    id_ticket: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(
        String(20), Computed("'TK-' || LPAD(id_ticket::TEXT, 3, '0')", persisted=True))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    asunto: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str | None] = mapped_column(Text)
    prioridad: Mapped[str] = mapped_column(PrioridadEnum, default="Media")
    estado: Mapped[str] = mapped_column(EstadoEnum, default="Abierto")
    fecha_primera_respuesta: Mapped[datetime | None] = mapped_column(DateTime)
    fecha_cierre: Mapped[datetime | None] = mapped_column(DateTime)
    calificacion: Mapped[int | None] = mapped_column(SmallInteger)
    comentario_calificacion: Mapped[str | None] = mapped_column(Text)
    id_empleado_reporta: Mapped[int] = mapped_column(ForeignKey("empleado.id_empleado"))
    id_empleado_tecnico: Mapped[int | None] = mapped_column(ForeignKey("empleado.id_empleado"))
    id_sla: Mapped[int] = mapped_column(ForeignKey("sla.id_sla"))
    id_categoria: Mapped[int | None] = mapped_column(ForeignKey("categoria.id_categoria"))
    id_incidente: Mapped[int | None] = mapped_column(Integer)

    reporta: Mapped[Empleado] = relationship(foreign_keys=[id_empleado_reporta])
    tecnico: Mapped[Empleado | None] = relationship(foreign_keys=[id_empleado_tecnico])
    sla: Mapped[SLA] = relationship()
    categoria: Mapped[Categoria | None] = relationship()
    equipos: Mapped[list[Equipo]] = relationship(secondary=ticket_equipo)
    seguimientos: Mapped[list["Seguimiento"]] = relationship(
        back_populates="ticket", order_by="Seguimiento.fecha_actualizacion", cascade="all, delete-orphan")


class Seguimiento(Base):
    __tablename__ = "seguimiento"
    id_seguimiento: Mapped[int] = mapped_column(primary_key=True)
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    comentario: Mapped[str] = mapped_column(Text)
    estado_actual: Mapped[str | None] = mapped_column(EstadoEnum)
    id_ticket: Mapped[int] = mapped_column(ForeignKey("ticket.id_ticket"))
    id_empleado_autor: Mapped[int] = mapped_column(ForeignKey("empleado.id_empleado"))

    ticket: Mapped[Ticket] = relationship(back_populates="seguimientos")
    autor: Mapped[Empleado] = relationship()


class Auditoria(Base):
    __tablename__ = "auditoria"
    id_auditoria: Mapped[int] = mapped_column(primary_key=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    accion_realizada: Mapped[str] = mapped_column(Text)
    id_ticket: Mapped[int] = mapped_column(ForeignKey("ticket.id_ticket"))
    id_empleado_responsable: Mapped[int] = mapped_column(ForeignKey("empleado.id_empleado"))

    ticket: Mapped[Ticket] = relationship()
    responsable: Mapped[Empleado] = relationship()
